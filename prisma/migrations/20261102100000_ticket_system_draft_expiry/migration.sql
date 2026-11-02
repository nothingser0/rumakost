ALTER TABLE tickets
  DROP CONSTRAINT tickets_cancelled_metadata_consistency,
  ADD CONSTRAINT tickets_cancelled_metadata_consistency CHECK (
    (status = 'CANCELLED'
      AND cancelled_at IS NOT NULL
      AND cancellation_reason IS NOT NULL
      AND btrim(cancellation_reason) <> ''
      AND (
        (cancelled_by_id IS NOT NULL
          AND status_changed_by_id IS NOT NULL
          AND cancelled_by_id = status_changed_by_id)
        OR (
          cancelled_by_id IS NULL
          AND status_changed_by_id IS NULL
          AND cancellation_reason = 'DRAFT_EXPIRED'
        )
      )
    )
    OR
    (status <> 'CANCELLED'
      AND cancelled_at IS NULL
      AND cancelled_by_id IS NULL
      AND cancellation_reason IS NULL)
  );

CREATE OR REPLACE FUNCTION guard_ticket_mutation() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  creator app_users%ROWTYPE;
  status_actor app_users%ROWTYPE;
  assignee app_users%ROWTYPE;
  selected_lease leases%ROWTYPE;
  local_date DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date;
  system_expiry BOOLEAN := FALSE;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'TICKET_HARD_DELETE_DENIED: cancel tickets to preserve history'
      USING ERRCODE = 'restrict_violation';
  END IF;

  IF TG_OP = 'INSERT' THEN
    SELECT * INTO creator FROM app_users
    WHERE id = NEW.created_by_id AND is_active = TRUE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'TICKET_CREATOR_INACTIVE: active account required';
    END IF;

    IF NEW.status <> 'DRAFT' OR NEW.closed_at IS NOT NULL OR NEW.cancelled_at IS NOT NULL THEN
      RAISE EXCEPTION 'TICKET_INITIAL_STATE_INVALID: new tickets start at DRAFT';
    END IF;

    IF creator.role = 'TENANT' THEN
      IF NEW.lease_id IS NULL THEN
        RAISE EXCEPTION 'TICKET_LEASE_REQUIRED: tenants must create tickets for an active lease';
      END IF;
      SELECT * INTO selected_lease FROM leases
      WHERE id = NEW.lease_id
        AND room_id = NEW.room_id
        AND tenant_user_id = NEW.created_by_id
        AND status = 'ACTIVE'
        AND starts_on <= local_date
        AND (ends_on IS NULL OR ends_on >= local_date);
      IF NOT FOUND THEN
        RAISE EXCEPTION 'TICKET_LEASE_NOT_OWNED_OR_ACTIVE: tenant must own an active lease for this room';
      END IF;
    ELSIF NEW.lease_id IS NOT NULL THEN
      PERFORM 1 FROM leases WHERE id = NEW.lease_id AND room_id = NEW.room_id;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'TICKET_LEASE_ROOM_MISMATCH: lease must belong to the selected room';
      END IF;
    END IF;

    IF NEW.assigned_to_id IS NOT NULL THEN
      SELECT * INTO assignee FROM app_users
      WHERE id = NEW.assigned_to_id AND is_active = TRUE AND role IN ('OWNER', 'STAFF');
      IF NOT FOUND THEN
        RAISE EXCEPTION 'TICKET_ASSIGNEE_INVALID: assign only to an active Owner or Staff';
      END IF;
    END IF;

    NEW.status_changed_by_id := NEW.created_by_id;
    RETURN NEW;
  END IF;

  IF OLD.status = 'CANCELLED' THEN
    RAISE EXCEPTION 'CANCELLED_TICKET_IMMUTABLE: cancelled tickets are terminal';
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.ticket_number IS DISTINCT FROM OLD.ticket_number
    OR NEW.room_id IS DISTINCT FROM OLD.room_id
    OR NEW.lease_id IS DISTINCT FROM OLD.lease_id
    OR NEW.created_by_id IS DISTINCT FROM OLD.created_by_id
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'TICKET_IDENTITY_IMMUTABLE: ticket source and identity cannot be changed';
  END IF;

  IF NEW.assigned_to_id IS NOT NULL THEN
    SELECT * INTO assignee FROM app_users
    WHERE id = NEW.assigned_to_id AND is_active = TRUE AND role IN ('OWNER', 'STAFF');
    IF NOT FOUND THEN
      RAISE EXCEPTION 'TICKET_ASSIGNEE_INVALID: assign only to an active Owner or Staff';
    END IF;
  END IF;

  IF NEW.resolution_summary IS DISTINCT FROM OLD.resolution_summary
    AND NOT (
      (OLD.status = 'INSPECTION' AND NEW.status = 'RESOLVED')
      OR (OLD.status = 'RESOLVED' AND NEW.status = 'IN_PROGRESS')
    ) THEN
    RAISE EXCEPTION 'TICKET_RESOLUTION_SUMMARY_STATE_INVALID: summary changes only on resolution';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status_changed_by_id IS NULL THEN
      IF OLD.status <> 'DRAFT'
        OR NEW.status <> 'CANCELLED'
        OR NEW.cancellation_reason IS DISTINCT FROM 'DRAFT_EXPIRED'
        OR OLD.created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
        OR NEW.cancelled_by_id IS NOT NULL THEN
        RAISE EXCEPTION 'TICKET_SYSTEM_EXPIRY_INVALID: system cancellation is only for expired drafts';
      END IF;
      system_expiry := TRUE;
    ELSE
      SELECT * INTO status_actor FROM app_users
      WHERE id = NEW.status_changed_by_id AND is_active = TRUE;
      IF NOT FOUND OR NOT (
        status_actor.role IN ('OWNER', 'STAFF')
        OR (OLD.status = 'DRAFT' AND NEW.status IN ('RECEIVED', 'CANCELLED')
          AND status_actor.role = 'TENANT' AND status_actor.id = NEW.created_by_id)
      ) THEN
        RAISE EXCEPTION 'TICKET_STATUS_ACTOR_INVALID: transition requires an active authorized actor';
      END IF;
      IF NEW.status = 'CANCELLED' AND NEW.cancellation_reason = 'DRAFT_EXPIRED' THEN
        RAISE EXCEPTION 'TICKET_SYSTEM_EXPIRY_REASON_RESERVED: DRAFT_EXPIRED is reserved for system expiry';
      END IF;
    END IF;

    IF OLD.status = 'DRAFT' AND NEW.status = 'RECEIVED' THEN
      SELECT * INTO creator FROM app_users WHERE id = NEW.created_by_id AND is_active = TRUE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'TICKET_CREATOR_INACTIVE: active account required to submit';
      END IF;
      IF creator.role = 'TENANT' THEN
        SELECT * INTO selected_lease FROM leases
        WHERE id = NEW.lease_id
          AND room_id = NEW.room_id
          AND tenant_user_id = NEW.created_by_id
          AND status = 'ACTIVE'
          AND starts_on <= local_date
          AND (ends_on IS NULL OR ends_on >= local_date);
        IF NOT FOUND THEN
          RAISE EXCEPTION 'TICKET_LEASE_NOT_OWNED_OR_ACTIVE: tenant must retain an active lease through submission';
        END IF;
      END IF;
    END IF;

    IF NOT (
      (OLD.status = 'DRAFT' AND NEW.status IN ('RECEIVED', 'CANCELLED'))
      OR (OLD.status = 'RECEIVED' AND NEW.status IN ('ASSIGNED', 'CANCELLED'))
      OR (OLD.status = 'ASSIGNED' AND NEW.status IN ('IN_PROGRESS', 'CANCELLED'))
      OR (OLD.status = 'IN_PROGRESS' AND NEW.status IN ('INSPECTION', 'CANCELLED'))
      OR (OLD.status = 'INSPECTION' AND NEW.status IN ('RESOLVED', 'CANCELLED'))
      OR (OLD.status = 'RESOLVED' AND NEW.status = 'IN_PROGRESS' AND status_actor.role = 'OWNER')
    ) THEN
      RAISE EXCEPTION 'INVALID_TICKET_TRANSITION: transition is not permitted';
    END IF;

    IF NEW.status = 'ASSIGNED' AND NEW.assigned_to_id IS NULL THEN
      RAISE EXCEPTION 'TICKET_ASSIGNEE_REQUIRED: ASSIGNED status requires an internal assignee';
    END IF;

    IF NEW.status = 'RESOLVED' THEN
      IF NEW.resolution_summary IS NULL OR btrim(NEW.resolution_summary) = '' THEN
        RAISE EXCEPTION 'TICKET_RESOLUTION_SUMMARY_REQUIRED: record the work performed';
      END IF;
      NEW.closed_at := CURRENT_TIMESTAMP;
      NEW.cancelled_at := NULL;
      NEW.cancelled_by_id := NULL;
      NEW.cancellation_reason := NULL;
    ELSIF OLD.status = 'RESOLVED' AND NEW.status = 'IN_PROGRESS' THEN
      NEW.reopened_at := CURRENT_TIMESTAMP;
      NEW.closed_at := NULL;
      NEW.resolution_summary := NULL;
    ELSIF NEW.status = 'CANCELLED' THEN
      IF NEW.cancellation_reason IS NULL OR btrim(NEW.cancellation_reason) = '' THEN
        RAISE EXCEPTION 'TICKET_CANCELLATION_REASON_REQUIRED: explain why the ticket is cancelled';
      END IF;
      NEW.cancelled_at := CURRENT_TIMESTAMP;
      IF system_expiry THEN
        NEW.cancelled_by_id := NULL;
      ELSE
        NEW.cancelled_by_id := NEW.status_changed_by_id;
      END IF;
      NEW.closed_at := CURRENT_TIMESTAMP;
      NEW.resolution_summary := NULL;
    ELSE
      NEW.closed_at := NULL;
      NEW.cancelled_at := NULL;
      NEW.cancelled_by_id := NULL;
      NEW.cancellation_reason := NULL;
    END IF;
  ELSIF NEW.status_changed_by_id IS DISTINCT FROM OLD.status_changed_by_id THEN
    RAISE EXCEPTION 'TICKET_STATUS_ACTOR_IMMUTABLE: actor changes only with a status transition';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION record_ticket_status_change() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO ticket_status_events
      (id, ticket_id, from_status, to_status, actor_type, actor_id, reason, resolution_summary)
    VALUES
      (gen_random_uuid(), NEW.id, OLD.status, NEW.status,
       CASE WHEN NEW.status_changed_by_id IS NULL
         THEN 'SYSTEM'::"TicketStatusActorType"
         ELSE 'USER'::"TicketStatusActorType"
       END,
       NEW.status_changed_by_id,
       CASE WHEN NEW.status = 'CANCELLED' THEN NEW.cancellation_reason ELSE NULL END,
       CASE WHEN NEW.status = 'RESOLVED' THEN NEW.resolution_summary ELSE NULL END);
  END IF;
  RETURN NEW;
END;
$$;

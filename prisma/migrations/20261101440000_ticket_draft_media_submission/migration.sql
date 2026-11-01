ALTER TABLE tickets ALTER COLUMN status SET DEFAULT 'DRAFT';

CREATE OR REPLACE FUNCTION guard_ticket_mutation() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  creator app_users%ROWTYPE;
  status_actor app_users%ROWTYPE;
  assignee app_users%ROWTYPE;
  selected_lease leases%ROWTYPE;
  local_date DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date;
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
      RAISE EXCEPTION 'TICKET_STATUS_ACTOR_REQUIRED: status transitions require an active Owner or Staff actor';
    END IF;
    SELECT * INTO status_actor FROM app_users
    WHERE id = NEW.status_changed_by_id AND is_active = TRUE;
    IF NOT FOUND OR NOT (
      status_actor.role IN ('OWNER', 'STAFF')
      OR (OLD.status = 'DRAFT' AND NEW.status IN ('RECEIVED', 'CANCELLED')
        AND status_actor.role = 'TENANT' AND status_actor.id = NEW.created_by_id)
    ) THEN
      RAISE EXCEPTION 'TICKET_STATUS_ACTOR_INVALID: transition requires an active authorized actor';
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
      NEW.cancelled_by_id := NEW.status_changed_by_id;
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

CREATE OR REPLACE FUNCTION require_ticket_initial_attachment() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'DRAFT' AND NEW.status = 'RECEIVED'
    AND NOT EXISTS (
      SELECT 1 FROM ticket_attachments
      WHERE ticket_id = NEW.id AND upload_status = 'AVAILABLE'
    ) THEN
    RAISE EXCEPTION 'TICKET_MEDIA_REQUIRED: at least one available attachment is required before submission';
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER tickets_require_initial_attachment ON tickets;
DROP TRIGGER ticket_attachments_preserve_required_media ON ticket_attachments;
CREATE CONSTRAINT TRIGGER tickets_require_available_attachment_before_submit
AFTER UPDATE ON tickets
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION require_ticket_initial_attachment();

CREATE OR REPLACE FUNCTION guard_ticket_attachment() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  selected_ticket tickets%ROWTYPE;
  uploader app_users%ROWTYPE;
  selected_lease leases%ROWTYPE;
  current_bytes BIGINT;
  batch_photos INTEGER;
  batch_videos INTEGER;
  local_date DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'TICKET_ATTACHMENT_HARD_DELETE_DENIED: retain media metadata'
      USING ERRCODE = 'restrict_violation';
  END IF;

  IF TG_OP = 'INSERT' THEN
    SELECT * INTO selected_ticket FROM tickets WHERE id = NEW.ticket_id FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'TICKET_NOT_FOUND';
    END IF;

    SELECT * INTO uploader FROM app_users
    WHERE id = NEW.uploaded_by_id AND is_active = TRUE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'TICKET_UPLOADER_INACTIVE: active account required';
    END IF;

    IF uploader.role = 'TENANT' THEN
      IF selected_ticket.lease_id IS NULL THEN
        RAISE EXCEPTION 'TICKET_UPLOAD_LEASE_REQUIRED';
      END IF;
      SELECT * INTO selected_lease FROM leases
      WHERE id = selected_ticket.lease_id
        AND tenant_user_id = NEW.uploaded_by_id
        AND room_id = selected_ticket.room_id
        AND status = 'ACTIVE'
        AND starts_on <= local_date
        AND (ends_on IS NULL OR ends_on >= local_date);
      IF NOT FOUND THEN
        RAISE EXCEPTION 'TICKET_UPLOAD_LEASE_FORBIDDEN';
      END IF;
      IF NEW.comment_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM ticket_comments
        WHERE id = NEW.comment_id AND visibility = 'INTERNAL'
      ) THEN
        RAISE EXCEPTION 'TICKET_UPLOAD_INTERNAL_COMMENT_FORBIDDEN';
      END IF;
    END IF;

    SELECT COALESCE(SUM(size_bytes), 0) INTO current_bytes
    FROM ticket_attachments
    WHERE ticket_id = NEW.ticket_id AND upload_status NOT IN ('FAILED', 'DELETED');
    IF current_bytes + NEW.size_bytes > 41943040 THEN
      RAISE EXCEPTION 'TICKET_MEDIA_TOTAL_LIMIT_EXCEEDED: maximum 40 MB per ticket';
    END IF;

    SELECT
      COUNT(*) FILTER (WHERE mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
      COUNT(*) FILTER (WHERE mime_type = 'video/mp4')
    INTO batch_photos, batch_videos
    FROM ticket_attachments
    WHERE ticket_id = NEW.ticket_id
      AND upload_batch_id = NEW.upload_batch_id
      AND upload_status NOT IN ('FAILED', 'DELETED');

    IF NEW.mime_type IN ('image/jpeg', 'image/png', 'image/webp') AND batch_photos >= 4 THEN
      RAISE EXCEPTION 'TICKET_MEDIA_BATCH_PHOTO_LIMIT_EXCEEDED: maximum 4 photos per upload batch';
    END IF;
    IF NEW.mime_type = 'video/mp4' AND batch_videos >= 1 THEN
      RAISE EXCEPTION 'TICKET_MEDIA_BATCH_VIDEO_LIMIT_EXCEEDED: maximum 1 video per upload batch';
    END IF;

    IF selected_ticket.status IN ('RESOLVED', 'CANCELLED') THEN
      NEW.delete_after := selected_ticket.closed_at + INTERVAL '365 days';
    ELSE
      NEW.delete_after := NULL;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.ticket_id IS DISTINCT FROM OLD.ticket_id
    OR NEW.comment_id IS DISTINCT FROM OLD.comment_id
    OR NEW.uploaded_by_id IS DISTINCT FROM OLD.uploaded_by_id
    OR NEW.upload_batch_id IS DISTINCT FROM OLD.upload_batch_id
    OR NEW.object_key IS DISTINCT FROM OLD.object_key
    OR NEW.mime_type IS DISTINCT FROM OLD.mime_type
    OR NEW.size_bytes IS DISTINCT FROM OLD.size_bytes
    OR NEW.duration_seconds IS DISTINCT FROM OLD.duration_seconds
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'TICKET_ATTACHMENT_METADATA_IMMUTABLE: uploaded media facts cannot be changed';
  END IF;

  IF NEW.delete_after IS DISTINCT FROM OLD.delete_after
    AND current_setting('rumakost.ticket_retention_update', TRUE) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'TICKET_ATTACHMENT_RETENTION_MANAGED: deadline follows ticket lifecycle';
  END IF;

  IF NEW.upload_status IS DISTINCT FROM OLD.upload_status AND NOT (
    (OLD.upload_status = 'PENDING_UPLOAD' AND NEW.upload_status IN ('AVAILABLE', 'FAILED', 'DELETE_PENDING'))
    OR (OLD.upload_status = 'AVAILABLE' AND NEW.upload_status = 'DELETE_PENDING')
    OR (OLD.upload_status = 'DELETE_PENDING' AND NEW.upload_status = 'DELETED')
  ) THEN
    RAISE EXCEPTION 'INVALID_TICKET_UPLOAD_TRANSITION: retry with a new attachment after failure';
  END IF;

  IF OLD.upload_status IN ('FAILED', 'DELETED') THEN
    RAISE EXCEPTION 'TICKET_ATTACHMENT_TERMINAL: failed or deleted media records are immutable';
  END IF;

  IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
    AND NOT (OLD.upload_status = 'DELETE_PENDING' AND NEW.upload_status = 'DELETED') THEN
    RAISE EXCEPTION 'TICKET_ATTACHMENT_DELETED_AT_IMMUTABLE';
  END IF;

  IF NEW.upload_status = 'DELETED' AND NEW.deleted_at IS NULL THEN
    NEW.deleted_at := CURRENT_TIMESTAMP;
  ELSIF NEW.upload_status <> 'DELETED' AND NEW.deleted_at IS NOT NULL THEN
    RAISE EXCEPTION 'TICKET_ATTACHMENT_DELETED_AT_INVALID';
  END IF;

  RETURN NEW;
END;
$$;
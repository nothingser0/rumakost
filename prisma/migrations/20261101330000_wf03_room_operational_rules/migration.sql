ALTER TABLE tenant_profiles
  ADD COLUMN phone_e164 VARCHAR(16),
  ADD CONSTRAINT tenant_profiles_phone_e164_format CHECK (
    phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9][0-9]{0,14}$'
  );

ALTER TABLE rooms
  ADD COLUMN maintenance_note VARCHAR(500);

ALTER TABLE tickets
  ADD COLUMN target_completion_on DATE;

CREATE FUNCTION guard_room_lifecycle() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'ROOM_HARD_DELETE_DENIED: archive the room to preserve operational history'
      USING ERRCODE = 'restrict_violation';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.archived_at IS NULL AND NEW.floor_id IS NOT NULL THEN
      PERFORM 1 FROM floors WHERE id = NEW.floor_id FOR UPDATE;
      IF EXISTS (SELECT 1 FROM floors WHERE id = NEW.floor_id AND archived_at IS NOT NULL) THEN
        RAISE EXCEPTION 'ROOM_ARCHIVED_FLOOR_DENIED: active room cannot reference an archived floor'
          USING ERRCODE = 'restrict_violation';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.archived_at IS NULL AND NEW.archived_at IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM leases
       WHERE room_id = OLD.id AND status IN ('SCHEDULED', 'ACTIVE')
     ) THEN
    RAISE EXCEPTION 'ROOM_ACTIVE_LEASE_ARCHIVE_DENIED: end or cancel scheduled/active leases first'
      USING ERRCODE = 'restrict_violation';
  END IF;

  IF NEW.physical_status IS DISTINCT FROM OLD.physical_status
     AND EXISTS (
       SELECT 1 FROM leases
       WHERE room_id = OLD.id AND status IN ('SCHEDULED', 'ACTIVE')
     ) THEN
    RAISE EXCEPTION 'ROOM_OCCUPIED_STATUS_CHANGE_DENIED: scheduled/active lease controls occupancy state'
      USING ERRCODE = 'restrict_violation';
  END IF;

  IF NEW.archived_at IS NULL AND NEW.floor_id IS NOT NULL THEN
    PERFORM 1 FROM floors WHERE id = NEW.floor_id FOR UPDATE;
  END IF;

  IF NEW.archived_at IS NULL AND NEW.floor_id IS NOT NULL
     AND EXISTS (SELECT 1 FROM floors WHERE id = NEW.floor_id AND archived_at IS NOT NULL) THEN
    RAISE EXCEPTION 'ROOM_ARCHIVED_FLOOR_DENIED: active room cannot reference an archived floor'
      USING ERRCODE = 'restrict_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER rooms_guard_lifecycle
BEFORE INSERT OR UPDATE OF archived_at, physical_status, floor_id OR DELETE ON rooms
FOR EACH ROW EXECUTE FUNCTION guard_room_lifecycle();

CREATE FUNCTION guard_floor_lifecycle() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'FLOOR_HARD_DELETE_DENIED: archive the floor to preserve room history'
      USING ERRCODE = 'restrict_violation';
  END IF;

  IF OLD.archived_at IS NULL AND NEW.archived_at IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM rooms
       WHERE floor_id = OLD.id AND archived_at IS NULL
     ) THEN
    RAISE EXCEPTION 'FLOOR_ACTIVE_ROOMS_ARCHIVE_DENIED: archive or move its rooms first'
      USING ERRCODE = 'restrict_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER floors_guard_lifecycle
BEFORE UPDATE OF archived_at OR DELETE ON floors
FOR EACH ROW EXECUTE FUNCTION guard_floor_lifecycle();

CREATE FUNCTION guard_lease_room_state() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  selected_room rooms%ROWTYPE;
BEGIN
  IF NEW.status IN ('SCHEDULED', 'ACTIVE') THEN
    SELECT * INTO selected_room FROM rooms WHERE id = NEW.room_id FOR UPDATE;

    IF selected_room.archived_at IS NOT NULL THEN
      RAISE EXCEPTION 'LEASE_ARCHIVED_ROOM_DENIED: scheduled/active lease requires an unarchived room'
        USING ERRCODE = 'restrict_violation';
    END IF;

    IF selected_room.physical_status = 'MAINTENANCE' THEN
      RAISE EXCEPTION 'LEASE_MAINTENANCE_ROOM_DENIED: scheduled/active lease requires a room outside maintenance'
        USING ERRCODE = 'restrict_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER leases_guard_room_state
BEFORE INSERT OR UPDATE OF room_id, status ON leases
FOR EACH ROW EXECUTE FUNCTION guard_lease_room_state();

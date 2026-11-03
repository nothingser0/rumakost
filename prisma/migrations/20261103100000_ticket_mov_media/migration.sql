ALTER TABLE ticket_attachments
  DROP CONSTRAINT ticket_attachments_allowed_media,
  ADD CONSTRAINT ticket_attachments_allowed_media CHECK (
    (mime_type IN ('image/jpeg', 'image/png', 'image/webp')
      AND size_bytes BETWEEN 1 AND 4194304
      AND duration_seconds IS NULL)
    OR
    (mime_type IN ('video/mp4', 'video/quicktime')
      AND size_bytes BETWEEN 1 AND 12582912
      AND duration_seconds IS NOT NULL
      AND duration_seconds BETWEEN 1 AND 30)
  );

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
      COUNT(*) FILTER (WHERE mime_type IN ('video/mp4', 'video/quicktime'))
    INTO batch_photos, batch_videos
    FROM ticket_attachments
    WHERE ticket_id = NEW.ticket_id
      AND upload_batch_id = NEW.upload_batch_id
      AND upload_status NOT IN ('FAILED', 'DELETED');

    IF NEW.mime_type IN ('image/jpeg', 'image/png', 'image/webp') AND batch_photos >= 4 THEN
      RAISE EXCEPTION 'TICKET_MEDIA_BATCH_PHOTO_LIMIT_EXCEEDED: maximum 4 photos per upload batch';
    END IF;
    IF NEW.mime_type IN ('video/mp4', 'video/quicktime') AND batch_videos >= 1 THEN
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

-- Keep the migration safe: fail before changing data if normalization would
-- create room-code conflicts or violate the approved room-data bounds.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM rooms
    GROUP BY upper(btrim(code))
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Room codes collide after trimming and uppercasing; resolve duplicates before applying 20261101320000_room_floor_lifecycle';
  END IF;

  IF EXISTS (
    SELECT 1 FROM rooms
    WHERE upper(btrim(code)) !~ '^[A-Z0-9-]{1,10}$'
  ) THEN
    RAISE EXCEPTION 'Room codes must normalize to 1-10 uppercase letters, digits, or hyphens before applying 20261101320000_room_floor_lifecycle';
  END IF;

  IF EXISTS (
    SELECT 1 FROM rooms
    WHERE monthly_rent <= 0 OR monthly_rent > 100000000
       OR deposit_default_amount < 0 OR deposit_default_amount > 100000000
  ) THEN
    RAISE EXCEPTION 'Room rent/deposit values are outside the approved range; correct data before applying 20261101320000_room_floor_lifecycle';
  END IF;

  IF EXISTS (
    SELECT 1 FROM rooms
    WHERE floor IS NOT NULL AND btrim(floor) = ''
  ) THEN
    RAISE EXCEPTION 'Blank room floor labels must be set to NULL before applying 20261101320000_room_floor_lifecycle';
  END IF;
END $$;

UPDATE rooms SET code = upper(btrim(code));

CREATE TABLE floors (
  id UUID NOT NULL,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  archived_at TIMESTAMPTZ(6),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT floors_pkey PRIMARY KEY (id),
  CONSTRAINT floors_name_nonblank CHECK (name = btrim(name) AND name <> ''),
  CONSTRAINT floors_normalized_name_matches CHECK (normalized_name = lower(btrim(name)))
);

CREATE UNIQUE INDEX floors_normalized_name_key ON floors(normalized_name);

INSERT INTO floors (id, name, normalized_name, created_at, updated_at)
SELECT gen_random_uuid(), min(btrim(floor)), lower(btrim(floor)), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM rooms
WHERE floor IS NOT NULL
GROUP BY lower(btrim(floor));

ALTER TABLE rooms ADD COLUMN floor_id UUID;
ALTER TABLE rooms ADD COLUMN archived_at TIMESTAMPTZ(6);

UPDATE rooms AS room
SET floor_id = floor.id
FROM floors AS floor
WHERE floor.normalized_name = lower(btrim(room.floor));

ALTER TABLE rooms DROP COLUMN floor;
ALTER TABLE rooms
  ADD CONSTRAINT rooms_floor_id_fkey
  FOREIGN KEY (floor_id) REFERENCES floors(id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX rooms_floor_id_idx ON rooms(floor_id);
CREATE INDEX rooms_archived_at_idx ON rooms(archived_at);

ALTER TABLE rooms DROP CONSTRAINT rooms_monthly_rent_nonnegative;
ALTER TABLE rooms DROP CONSTRAINT rooms_deposit_default_nonnegative;
ALTER TABLE rooms
  ADD CONSTRAINT rooms_code_canonical CHECK (
    code = upper(btrim(code)) AND code ~ '^[A-Z0-9-]{1,10}$'
  ),
  ADD CONSTRAINT rooms_monthly_rent_range CHECK (
    monthly_rent > 0 AND monthly_rent <= 100000000
  ),
  ADD CONSTRAINT rooms_deposit_default_range CHECK (
    deposit_default_amount >= 0 AND deposit_default_amount <= 100000000
  );

ALTER TABLE rooms ALTER COLUMN deposit_default_amount DROP DEFAULT;

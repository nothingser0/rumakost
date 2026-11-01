ALTER TABLE "rooms"
ADD COLUMN "width_m" DECIMAL(5,2),
ADD COLUMN "length_m" DECIMAL(5,2);

ALTER TABLE "rooms"
ADD CONSTRAINT "rooms_dimensions_pair_positive"
CHECK (
  ("width_m" IS NULL) = ("length_m" IS NULL)
  AND ("width_m" IS NULL OR ("width_m" > 0 AND "length_m" > 0))
);

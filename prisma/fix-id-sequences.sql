SELECT setval(
  pg_get_serial_sequence('"Season"', 'id'),
  COALESCE((SELECT MAX(id) + 1 FROM "Season"), 1),
  false
);

SELECT setval(
  pg_get_serial_sequence('"Game"', 'id'),
  COALESCE((SELECT MAX(id) + 1 FROM "Game"), 1),
  false
);

SELECT setval(
  pg_get_serial_sequence('"Tournament"', 'id'),
  COALESCE((SELECT MAX(id) + 1 FROM "Tournament"), 1),
  false
);
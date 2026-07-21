SELECT setval(
  pg_get_serial_sequence('"Tournament"', 'id'),
  1,
  false
);
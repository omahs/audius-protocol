begin;

SELECT pg_cancel_backend(pid) FROM pg_stat_activity WHERE state = 'active' and pid <> pg_backend_pid();
lock table tracks in access exclusive mode;

UPDATE tracks
SET release_date = created_at
WHERE release_date IS NULL;

commit;
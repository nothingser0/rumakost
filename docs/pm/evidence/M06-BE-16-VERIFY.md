# Raw Verify M06-BE-16

Runtime: Node.js v24.22.2

Command: `npm run test -- tenant-profile`

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs tenant-profile

✔ Tenant can update only their own profile (6.7475ms)
✔ Tenant cannot update another Tenant profile (0.9672ms)
✔ Owner can update a target Tenant profile (0.6602ms)
✔ Staff cannot write Tenant profiles (0.2847ms)
✔ inactive or forced-password-change actors cannot update a profile (0.3612ms)
✔ phone and bounded profile fields follow E.164 and database lengths (2.3214ms)
✔ emergency contact name and phone are changed or cleared together (0.706ms)
✔ profile input rejects email, Lease, and unknown fields (0.7164ms)
✔ audit metadata contains changed field names without contact values (0.4651ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 260.6073
```

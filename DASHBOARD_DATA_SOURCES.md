# MoPA Dashboard — Where the numbers come from

Every chart and number on the dashboard is counted live from the Bill records.
Nothing is typed into the dashboard by hand (BRD §8 Auto Reports & Charts).

| Chart or number | What it tells you | Data it is counted from | BRD |
|---|---|---|---|
| Where bills are now | Bills at each step of the law-making process | Stage date recorded by a Data Manager | §8, §9 |
| What happened to each bill | Pending, passed, deferred, withdrawn, assented | House decision and President's decision dates | §9, §13 |
| Bills with the Standing Committee: on time? | Inside or past the Committee time limit | Committee referral date. Limit: 30 days (NA), 60 days (Senate) | §8 |
| Bills sent to the other House | Inside or past the 90-day Constitutional limit | Date sent to the other House. Limit: 90 days | §8 |
| Bills waiting for the President | Endorsed, assented, notified, Gazette-published | MoPA endorsement, President's decision, Notification dates | §9 |
| How long bills have waited | Days at current stage | Today minus stage date. Bands 0–15, 16–30, 31–60, 61–90, 90+ (prototype choice) | §16 |
| Pending actions by Ministry / Division | Overdue, replies due, in progress, assented, deferred | Ministry field + deadline and reply status | §13 |
| Article 74 (Private Members' Bills) | Ministry stance and Cabinet consent | Pre-admissibility fields | §8, §9 |
| Month-by-month activity | Registered, passed, assented per month (last 12 months) | Registration, passed, assented dates | §16 |
| National Assembly vs Senate | Bills by House of origin | House of origin field | §9, §16 |

How a number gets here: a Data Manager records a stage date and reference → the
Bill record and audit trail are saved → the dashboard counts it on the next view.

Prototype note: the figures currently come from sample Bills in the prototype.

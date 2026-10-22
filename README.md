# RK Finance

A single-office Gold Loan and Finance Loan Management **demo ERP** with separate loan registers, daily collections, printable receipts and simulated customer messaging.

## Run locally

Requirements: Node.js 20 or newer. No dependencies, API keys, database setup or build step are required.

```sh
git clone https://github.com/navani25/RK-Finance.git
cd RK-Finance
npm start
```

Open **http://127.0.0.1:4186**. Stop the server with `Ctrl+C`.

Alternatively, run `node serve.cjs` directly.

## Demo sign-in

| Role | User ID | Password |
| --- | --- | --- |
| Admin | RK-ADMIN | demo123 |
| Manager | RK-MANAGER | manager123 |
| Staff | RK-STAFF | staff123 |

These are public, fictional demo credentials, not production accounts.

## Features

- Dashboard with portfolio, collections and due follow-ups.
- Separate Finance and Gold loan registers, search and status filters.
- Customer details and photos; gold details, images, packet custody and release.
- Application approval, disbursement, collection, full settlement and loan closure.
- Printable payment receipts, loan statements and closure documents.
- Separate Finance/Gold collections and SMS/reminder history.
- Reports and spreadsheet export.
- Admin-managed staff/manager accounts, activation and deactivation.

## Ready-made demo scenarios

Search **Demo** in Finance Loans or Gold Loans, then click **View loan**.

| Account suffix | What to demonstrate |
| --- | --- |
| PENDING | Approve an application |
| APPROVED | Activate / disburse, then view the amount SMS preview |
| TODAY | Record a collection or close / settle the small remaining balance |
| OVERDUE | Follow-up and manual reminder |
| REMINDER | Five-day due reminder history |
| CLOSED | Closure receipt, payment receipt and closure SMS history |
| REJECTED | Rejected application |
| RELEASED — Gold only | Completed gold release |

Scenario dates are relative to first setup. Customer/gold sample images are labelled illustrations. Samples are added once without deleting existing browser records.

## OTP and SMS demonstration

1. **Gold pledge OTP:** New gold loan → enter customer mobile → Send demo OTP → enter the displayed six-digit code → Verify OTP → save the application. The code expires in five minutes. Changing the mobile or resending requires fresh verification.
2. **Disbursement SMS:** save disbursement on an Approved loan to see the company-branded amount/mode/date message.
3. **Closure SMS:** fully settle an Active loan to see the final payment, zero balance and receipt reference.
4. **Due reminder:** when the app is opened, active accounts due within the next five days receive one simulated reminder per due date. It is not a background or daily messaging service.

History is available under **Collections → Finance / Gold → SMS & reminders**, and inside each loan's **SMS & reminder history**.

**No real SMS, real OTP delivery, money transfer or identity verification takes place.**

## Tests

```sh
npm test
```

Tests cover roles, access restrictions, loan lifecycle, photos, payment allocation, receipts, settlement, gold release, demo OTP, SMS previews, reminder deduplication, demo-data migration and reports.

## Project structure

```text
dist/           Application HTML, CSS and JavaScript
tests/          Automated demo workflow and role checks
serve.cjs       Dependency-free local static server
package.json    Start and test commands
```

The application is hosting-independent. Any static host can serve `dist/`; no platform-specific hosting configuration is included.

## Data and production limitations

Records and demo team accounts are stored in browser **localStorage**; uploaded photos are stored in **IndexedDB**. Files in this repository do not contain customer records saved in a browser. Different browsers, hostnames or ports have separate data, and clearing browser storage can remove records.

Use fictional information only. This is **not production financial software**. Production use requires a secure backend, server-side authorization and validation, proper authentication, backups, compliant messaging/OTP integration, and business/regulatory review. Client-side role controls and demonstration password hashing are not a production security boundary.

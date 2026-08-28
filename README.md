# GoOrder — URL map

Two apps. **Different ports. Different auth routes. Different dashboards.**

| App | Port | Launch (base URL) | Who |
| --- | --- | --- | --- |
| **Customer** | `3000` | [http://localhost:3000](http://localhost:3000) → **customer sign up** | Browse, cart, buy after login |
| **Admin** | `3001` | [http://localhost:3001](http://localhost:3001) → redirects to **`/admin/login`** | Control orders, users, catalog, delivery |

Customer sign up/login **never** uses the same path as admin login.

**There is no public admin sign up.** Staff accounts are created inside **Admin → Users** by a Super Admin / Admin with `users:write`.

---

## Quick start

```bash
cp .env.example .env.local
# Also copy apps/client/.env.example and apps/admin/.env.example if present
npm install
npm run postinstall
npm run db:seed
npm run dev
```

| Open this | What you get |
| --- | --- |
| http://localhost:3000 | Customer **sign up** (base URL) |
| http://localhost:3000/login | Customer **sign in** |
| http://localhost:3000/home | Marketplace (after login) |
| http://localhost:3001 | Redirects to admin **sign in** |
| http://localhost:3001/admin/login | Admin **sign in** only |

### Demo accounts

| Email | Password | Use this URL |
| --- | --- | --- |
| `user@example.com` | `User1234!` | http://localhost:3000/login → `/home` + `/dashboard` |
| `admin@example.com` | `Admin123!` | http://localhost:3001/admin/login → `/admin` |

---

## Customer URLs — `http://localhost:3000`

### Auth (customer only)

| Full URL | Page |
| --- | --- |
| http://localhost:3000/ | **Customer sign up** (base URL) |
| http://localhost:3000/register | Redirects to `/` |
| http://localhost:3000/login | Customer sign in |
| http://localhost:3000/forgot-password | Forgot password |
| http://localhost:3000/reset-password | Reset password |

### Shop / purchase (login required)

| Full URL | Page |
| --- | --- |
| http://localhost:3000/home | Marketplace home |
| http://localhost:3000/products | Catalog |
| http://localhost:3000/deals | Flash sale |
| http://localhost:3000/products/[slug] | Product detail |
| http://localhost:3000/categories | Categories |
| http://localhost:3000/categories/[slug] | Category products |
| http://localhost:3000/vendors | Vendors |
| http://localhost:3000/vendors/[slug] | Vendor store |
| http://localhost:3000/cart | Cart |
| http://localhost:3000/checkout | Checkout |
| http://localhost:3000/checkout/success | Order confirmation |

### Customer dashboard

| Full URL | Page |
| --- | --- |
| http://localhost:3000/dashboard | Customer home |
| http://localhost:3000/orders | My orders |
| http://localhost:3000/orders/[orderNumber] | Tracking |
| http://localhost:3000/invoices | Invoices |
| http://localhost:3000/notifications | Alerts |
| http://localhost:3000/favorites | Saved products |
| http://localhost:3000/credit | Credit |
| http://localhost:3000/quotations | Quotations |
| http://localhost:3000/chat | Chat with GoOrder Admin |
| http://localhost:3000/profile | Profile |

### Customer API auth

| Method | Path |
| --- | --- |
| POST | `/api/auth/customer/register` |
| POST | `/api/auth/customer/login` |
| POST | `/api/auth/customer/logout` |
| GET | `/api/auth/customer/me` |

---

## Admin URLs — `http://localhost:3001`

Staff enter only via **`/admin/login`**. After login they land on **`/admin`**.

### Auth (admin only)

| Full URL | Page |
| --- | --- |
| http://localhost:3001/ | Redirects to `/admin/login` |
| http://localhost:3001/admin/login | Admin sign in |
| — | **No** `/admin/register` (staff created at `/admin/users`) |

### Admin dashboard (control panel)

| Full URL | Page |
| --- | --- |
| http://localhost:3001/admin | Admin dashboard |
| http://localhost:3001/admin/orders | All customer orders |
| http://localhost:3001/admin/orders/[orderNumber] | Order detail |
| http://localhost:3001/admin/users | Staff users — **register / suspend / delete** |
| http://localhost:3001/admin/clients | Customer accounts |
| http://localhost:3001/admin/clients/[id] | Customer detail |
| http://localhost:3001/admin/products | Products |
| http://localhost:3001/admin/categories | Categories |
| http://localhost:3001/admin/vendors | Vendors |
| http://localhost:3001/admin/credit | Credit |
| http://localhost:3001/admin/invoices | Invoices |
| http://localhost:3001/admin/invoices/alerts | Invoice alerts |
| http://localhost:3001/admin/purchases | Vendor purchases |
| http://localhost:3001/admin/payments | Payments |
| http://localhost:3001/admin/chat | Client chat |
| http://localhost:3001/admin/settings | Settings |
| http://localhost:3001/delivery | Delivery jobs |

### ERP / operations

| Full URL | Page |
| --- | --- |
| http://localhost:3001/bi | Business intelligence |
| http://localhost:3001/procurement | Procurement |
| http://localhost:3001/inventory | Inventory |
| http://localhost:3001/accounting | Accounting |
| http://localhost:3001/crm | CRM & support |
| http://localhost:3001/ai-forecasting | AI forecasting |
| http://localhost:3001/assets | Assets |
| http://localhost:3001/tenders | Tenders |

### Admin API auth

| Method | Path |
| --- | --- |
| POST | `/api/auth/admin/login` |
| POST | `/api/auth/admin/logout` |
| GET | `/api/auth/admin/me` |
| GET/POST | `/api/users` (list / create staff) |
| PATCH/DELETE | `/api/users/[id]` (suspend / delete staff) |

---

## Two dashboards (do not mix)

| | Customer | Admin |
| --- | --- | --- |
| **URL** | http://localhost:3000/dashboard | http://localhost:3001/admin |
| **Job** | Buy: cart, checkout, invoices, track orders, chat | Control: orders, users, catalog, invoices, delivery |
| **Session** | `customer_session` cookie | `admin_session` cookie |

A customer cannot open the admin panel. Staff cannot use the customer marketplace account on port 3000 with the admin cookie.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Customer `3000` + admin `3001` |
| `npm run dev:client` | Customer only |
| `npm run dev:admin` | Admin only |
| `npm run build` | Build both apps |
| `npm run postinstall` | Prisma generate |
| `npm run db:seed` | Demo users + catalog |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

---

Private project — adapt for your organization.

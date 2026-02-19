# Inventory Booking Cart — Exact Requirements & User Experience Flow

## 1. Purpose

The **Inventory Booking Cart** is a WeWeb custom component that acts as an add-to-cart and booking form. It displays cart items (from a list of SKUs) with live inventory data, lets users add SKUs manually or from the inventory list, set quantities and order, then complete a booking with a title and PIC. Users can also load and edit an existing booking.

---

## 2. Exact Requirements

### 2.1 Bindable Data (6 + 1)

| # | Property | Type | Description |
|---|----------|------|-------------|
| 1 | **Reference data** | ObjectList (bindable) | Original Supabase **Inventory_Data** collection. Used to resolve SKU → Model, Color, SNT, ImageLink, etc. for display and availability. |
| 2 | **Cart data** | ObjectList (bindable) | A **variable** holding the list of items in the cart. Can be an array of **SKU strings** (e.g. `["ACE2-FROZEN-18OZ", "ACE2-STGR-18OZ"]`) or an array of **objects** `{ SKU, Quantity }`. The tool uses reference data to fill in Model, Color, image, and available quantity for each cart item. |
| 3 | **Teammates list** | ObjectList (bindable) | List of people (e.g. **Teammates** collection): `id`, `Name`, and optionally `Type`, `Email`, `Phone`, etc. Used for the PIC dropdown and for displaying PIC name in the “Edit existing booking” dropdown. |
| 4 | **Buffer** | Boolean (bindable) | When **on**, available quantity shown and used for overbooking check is **SNT − 25** from reference data. When **off**, raw **SNT** is used. |
| 5 | **Booking_Headers** | ObjectList (bindable) | Supabase **Booking_Headers** collection: `id`, `BookingNumber`, `created_at`, `BookingTitle`, `PIC_ID`. Used to list and load existing bookings for editing. |
| 6 | **Booking_Items** | ObjectList (bindable) | Supabase **Booking_Items** collection: `id`, `HeaderID`, `SKU`, `Quantity`, `Status`, `updated_at`. Used to load line items when user selects an existing booking to edit. |
| 7 | **Editing booking (Header ID)** | Text (bindable) | Variable set by the app when loading a booking for edit. When non-empty (UUID), the component is in “edit” mode: On Booked will use that header’s `BookingNumber` and send `isEdit: true`, `headerId`. When empty, the component is in “new booking” mode. |

### 2.2 Data Shapes (Reference)

- **Cart data (variable)**  
  - Option A: array of SKU strings → `["ACE2-FROZEN-18OZ", "ACE2-STGR-18OZ", "ACE2-BLK-18OZ"]`  
  - Option B: array of objects → `[{ SKU: "ACE2-FROZEN-18OZ", Quantity: 1 }, ...]`  
  - The component **emits** cart updates always as `[{ SKU, Quantity }, ...]` so the bound variable can be updated to that shape and quantities are preserved.

- **Reference data (Inventory_Data)**  
  - Fields: `SKU`, `Type`, `Model`, `Color`, `Size`, `Tags`, `SNT`, `ImageLink` (and any others). Component uses SKU to look up and show Model, Color, image, and available (SNT or SNT−25 if Buffer on).

- **Teammates**  
  - At least: `id` (uuid), `Name`. Optional: `Type`, `MasterName`, `Email`, `Phone`.

- **Booking_Headers**  
  - `id`, `BookingNumber`, `created_at`, `BookingTitle`, `PIC_ID`.

- **Booking_Items**  
  - `id`, `HeaderID`, `SKU`, `Quantity`, `Status`, `updated_at`.

### 2.3 Display & Behaviour

- **Cart display**  
  - For each item in **Cart data**, the component looks up the SKU in **Reference data** and shows: **image** (or “No image”), **Model**, **Color**, **quantity available** (SNT or SNT−25 if Buffer on), and a **quantity input** for the user’s desired booking quantity.

- **Manual add SKU**  
  - Text input; user types a SKU and presses **Enter**.  
  - If the SKU **exists** in reference data: component emits **On Manual Add SKU** with the **reference row** (full Inventory_Data object). The app workflow should add that SKU to the cart variable (e.g. append `{ SKU: $event.value.SKU, Quantity: 1 }` or the string `$event.value.SKU`).  
  - If **no match**: show **“No Match Found”** and do not emit.

- **Cart actions**  
  - **Change quantity** per line → emit **On Quantity Change** with `event.cart` = new array `[{ SKU, Quantity }, ...]`.  
  - **Remove** item → emit **On Remove From Cart** with `event.cart` = array without that SKU.  
  - **Reorder** (move up/down) → emit **On Reorder Cart** with `event.cart` = reordered array.  
  - App workflows should **update the Cart data variable** with `$event.cart` for these three events.

- **Booking details (required to proceed)**  
  - **Booking title**: free text.  
  - **Booking PIC**: dropdown from **Teammates list** (display Name, value = id).  
  - If **either** is empty, the **Proceed** button is **disabled**.

- **Edit existing booking**  
  - Dropdown with search: list comes from **Booking_Headers**; each option shows **BookingNumber**, **BookingTitle**, and **PIC name** (resolve `PIC_ID` via Teammates).  
  - Search/filter by number, title, or PIC name.  
  - **“— New booking —”**: clears cart and edit state; workflow should set Cart data to `[]` and **Editing booking (Header ID)** to empty.  
  - **Select an existing booking**: component emits **On Load Booking (Edit)** with `headerId`, `bookingNumber`, `bookingTitle`, `picId`, `cart` (array of `{ SKU, Quantity }` from **Booking_Items** for that header). Workflow should: set **Cart data** = `$event.cart`, set **Editing booking (Header ID)** = `$event.headerId`, and optionally set booking title and PIC variables if bound elsewhere. Component pre-fills title and PIC in the form when a booking is selected.

- **Proceed button**  
  - **Disabled** if booking title or PIC is missing.  
  - **Enabled** when both are filled.  
  - If **every** line has requested quantity ≤ available: button label is **“Proceed”** (normal style).  
  - If **any** line has requested quantity **&gt;** available: button label is **“Proceed Overbooking”** and styled in **red** (user proceeds at their own risk).

- **On Booked**  
  - When user clicks Proceed, component emits **On Booked** with:  
    - `created_at`: timestamp (ISO, e.g. Kuala Lumpur time / now).  
    - `updated_at`: timestamp (now; or latest when editing).  
    - `pic_uuid`: selected Teammate id.  
    - `BookingNumber`: when **editing**, the existing header’s BookingNumber; when **new**, a generated id (e.g. `BN-123456` format).  
    - `BookingItems`: array of `{ SKU, Quantity }` from current cart.  
    - `isEdit`: boolean; `true` when updating an existing booking.  
    - `headerId`: UUID of Booking_Header when editing; null when new.  
  - The app workflow uses this payload to create or update **Booking_Headers** and **Booking_Items** in Supabase.

### 2.4 Layout & Style

- **Layout**: Vertical (portrait), single column; component is its own block (e.g. sidebar or panel), not landscape.  
- **Sections**: Add SKU → Booking cart → Booking details → Edit existing booking → Proceed.  
- **Disclaimer**: Line such as “*Inventory availability subject to change until reserved.”  
- Styling should match the rest of the app: light greys, white cards, blue primary button, clean borders and spacing.

---

## 3. User Experience Flow

### 3.1 New booking (add from inventory list)

1. User is on a page that shows **inventory** (e.g. grid with Model, Color, Available, “Add Item” per SKU).  
2. User clicks **“Add Item”** on one or more SKUs.  
3. App workflow adds each selected SKU to the **Cart data** variable (e.g. append string or `{ SKU, Quantity: 1 }`).  
4. **Booking Cart** component shows those items: image, Model, Color, “X Available”, and a quantity input (default 1).  
5. User can change **quantity** per line; each change emits **On Quantity Change** and the app updates the cart variable.  
6. User can **remove** an item or **reorder** (up/down).  
7. User fills **Booking title** and selects **PIC** from the dropdown.  
8. If any line has qty &gt; available, the button shows **“Proceed Overbooking”** in red; otherwise **“Proceed”**.  
9. User clicks **Proceed**.  
10. Component emits **On Booked** with full payload.  
11. App workflow creates a new **Booking_Header** and **Booking_Items** in Supabase, then typically clears the cart variable and optionally shows success or navigates.

### 3.2 New booking (add SKU manually)

1. Cart can be empty or already have items.  
2. User types a **SKU** in the “Add SKU” input (e.g. `ACE2-FROZEN-18OZ`) and presses **Enter**.  
3. If the SKU exists in **Reference data**: component emits **On Manual Add SKU** with that reference row; workflow adds that SKU to the **Cart data** variable. The new line appears in the cart with Model, Color, available, and qty 1.  
4. If the SKU does **not** exist: component shows **“No Match Found”** and does not add anything.  
5. From here, flow continues as in **3.1** (adjust quantities, title, PIC, Proceed).

### 3.3 Edit existing booking

1. User uses the **“Edit existing booking”** section.  
2. User can type in the **search** field to filter by Booking number, title, or PIC name.  
3. User selects an option from the dropdown (e.g. “BN-123456 · Test Booking · Hakimi Fairus”).  
4. Component emits **On Load Booking (Edit)** with that booking’s `headerId`, `bookingNumber`, `bookingTitle`, `picId`, and `cart` (items from **Booking_Items** for that header).  
5. App workflow sets **Cart data** = `$event.cart` and **Editing booking (Header ID)** = `$event.headerId`.  
6. Component fills the cart list, **Booking title**, and **PIC** from the loaded booking.  
7. User can change quantities, add/remove lines (via manual SKU or from inventory if the app allows), and change title or PIC.  
8. User clicks **Proceed**.  
9. Component emits **On Booked** with `isEdit: true`, `headerId`, same `BookingNumber`, and updated `BookingItems` (and timestamps).  
10. App workflow **updates** the existing **Booking_Header** and **Booking_Items** (e.g. replace items for that header) in Supabase, then typically clears **Editing booking (Header ID)** and optionally the cart.

### 3.4 Start a new booking after editing (or clear cart)

1. In **“Edit existing booking”**, user selects **“— New booking —”**.  
2. Component emits **On Load Booking (Edit)** with `headerId: null`, `cart: []`, empty title/picId.  
3. App workflow sets **Cart data** = `[]` and **Editing booking (Header ID)** = empty.  
4. Cart and form clear; user can add items again for a new booking.

### 3.5 Overbooking

1. User has one or more lines where **requested quantity &gt; available** (after Buffer if on).  
2. Button shows **“Proceed Overbooking”** in red.  
3. User can still click it; component emits **On Booked** as usual.  
4. App can choose to allow or block overbooking in Supabase or business logic.

---

## 4. Event Summary (for Workflows)

| Event | When | Payload (main) | Typical workflow action |
|-------|------|----------------|-------------------------|
| **On Manual Add SKU** | User enters a SKU that exists in reference | `event.value` = reference row (Inventory_Data) | Add `{ SKU: $event.value.SKU, Quantity: 1 }` to Cart variable |
| **On Remove From Cart** | User removes a line | `event.cart` = new array | Set Cart variable = `$event.cart` |
| **On Quantity Change** | User changes qty input | `event.cart` = new array | Set Cart variable = `$event.cart` |
| **On Reorder Cart** | User moves line up/down | `event.cart` = reordered array | Set Cart variable = `$event.cart` |
| **On Load Booking (Edit)** | User selects “New booking” or an existing booking | `event.headerId`, `event.cart`, `event.bookingTitle`, `event.picId`, etc. | Set Cart = `$event.cart`, set Editing Header ID = `$event.headerId` (or empty) |
| **On Booked** | User clicks Proceed | `event.value`: `created_at`, `updated_at`, `pic_uuid`, `BookingNumber`, `BookingItems`, `isEdit`, `headerId` | Create or update Booking_Headers and Booking_Items in Supabase; clear cart / editing state as needed |

---

## 5. Database Context (Reference)

- **Booking_Headers**: `id`, `BookingNumber` (unique), `created_at`, `BookingTitle`, `PIC_ID` (FK → Teammates).  
- **Booking_Items**: `id`, `HeaderID` (FK → Booking_Headers), `SKU`, `Quantity`, `Status`, `updated_at`.  
- **Inventory_Data**: `SKU` (PK), `Model`, `Color`, `SNT`, `ImageLink`, etc.  
- **Teammates**: `id` (PK), `Name`, etc.

This document is the single source of truth for the Inventory Booking Cart’s requirements and user experience flow.

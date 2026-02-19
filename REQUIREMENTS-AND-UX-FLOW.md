# Inventory Booking Cart — Updated Requirements & User Experience Flow

## 1. Purpose

The **Inventory Booking Cart** is a WeWeb custom component that acts as an add-to-cart and booking form. It displays cart items with live inventory data, lets users add SKUs via Quick Add, set quantities, and complete a booking with a title and Person In Charge. Users can also connect to and modify an existing booking.

---

## 2. Layout

- **Two-panel horizontal layout** (flex, row)
  - **Left panel (70%)**: Booking Cart — header, item table (or empty state)
  - **Right panel (20%)**: Booking Actions — Existing Booking, Quick Add SKU, Booking Title, Person In Charge, Confirm
  - **Column gap**: 5px

---

## 3. Bindable Data

| Property | Type | Description |
|----------|------|-------------|
| **Reference data** | ObjectList | Inventory_Data (SKU, Model, Color, Size, SNT, ImageLink). Used for display and availability. |
| **Cart data** | ObjectList | Variable holding `[{ SKU, Quantity }, ...]`. Synced into component when **not connected** to an existing booking. |
| **Teammates list** | ObjectList | Teammates (id, Name). Used for Person In Charge dropdown. |
| **Buffer** | Boolean | When on, available = SNT − 25. When off, available = SNT. |
| **Booking_Headers** | ObjectList | id, BookingNumber, BookingTitle, PIC_ID. For Existing Booking dropdown. |
| **Booking_Items** | ObjectList | id, HeaderID, SKU, Quantity. Loaded when user Connects to a booking. |

---

## 4. Events (3 only)

| Event | When | Payload | Workflow action |
|-------|------|---------|-----------------|
| **On Remove From Cart** | User removes an item (trash icon) | `event.cart` = new array | Set Cart variable = `$event.cart` |
| **On Overbooking** | User clicks Confirm when any line has qty > available | `event.value.overbooked: true` | Optional: show warning, log, etc. |
| **On Booking** | User clicks Confirm | `event.value`: `isEdit`, `headerId`, `BookingNumber`, `BookingItems`, `pic_uuid`, `created_at`, `updated_at` | Create or update Booking_Headers and Booking_Items in Supabase |

---

## 5. User Experience Flow

### 5.1 New booking (add from inventory list)

1. User is on a page with inventory (e.g. grid with “Add Item” per SKU).
2. User clicks **Add Item** on one or more SKUs.
3. App workflow adds each SKU to the **Cart data** variable (e.g. append `{ SKU, Quantity: 1 }`).
4. **Booking Cart** component shows those items in the **left panel**: image, Model, Color · Size, SKU, availability, quantity input, remove button.
5. User can change **quantity** per line (no event; internal state).
6. User can **remove** an item → component emits **On Remove From Cart**; workflow updates Cart variable.
7. In the **right panel**, user fills **Booking Title** and selects **Person In Charge**.
8. If any line has qty > available, button shows **“Proceed (Overbooked)”** in red; otherwise **“Confirm Booking”**.
9. User clicks **Confirm**.
10. If overbooked, component emits **On Overbooking** then **On Booking**; otherwise **On Booking** only.
11. Workflow creates **Booking_Header** and **Booking_Items** in Supabase, then clears the cart variable and optionally shows success or navigates.

### 5.2 New booking (Quick Add SKU)

1. Cart can be empty or already have items.
2. In the **right panel**, user types a **SKU** in “Scan or type SKU...” and presses **Enter** or clicks the blue **Add** arrow.
3. If the SKU exists in **Reference data**: component adds `{ SKU, Quantity: 1 }` to the cart (no event). The new line appears in the left panel.
4. If the SKU does **not** exist: component shows **“No Match Found”** and does not add.
5. User can click the **X** next to “QUICK ADD SKU” to clear the input and error.
6. Flow continues as in **5.1** (adjust quantities, title, PIC, Confirm).

### 5.3 Edit existing booking (Connect)

1. In the **right panel**, under **EXISTING BOOKING**, user selects a booking from the dropdown (e.g. “BN-123456 · Test Booking”).
2. User clicks the **chain-link (Connect)** icon.
3. Component loads that booking’s items from **Booking_Items**, plus title and PIC from **Booking_Headers**.
4. **Left panel** shows the loaded items. **Subtitle** changes to “Modifying Order #BN-123456”.
5. Cart is **no longer synced** from Cart data; it is only the loaded booking.
6. User can change quantities, add items via Quick Add, remove items.
7. User can change **Booking Title** and **Person In Charge**.
8. User clicks **Confirm**.
9. Component emits **On Booking** with `isEdit: true`, `headerId`, same `BookingNumber`, and updated `BookingItems`.
10. Workflow **updates** the existing **Booking_Header** and **Booking_Items** in Supabase.

### 5.4 Disconnect (start fresh)

1. When **connected** to an existing booking, the chain icon is replaced by an **X (Disconnect)** icon.
2. User clicks **Disconnect**.
3. Component clears internal cart, title, PIC, and connected state.
4. Cart becomes empty; subtitle returns to “Drafting New Order”.
5. Cart will sync again from **Cart data** when the workflow updates it (e.g. after user adds from inventory list).

### 5.5 Overbooking

1. User has one or more lines where **requested quantity > available** (after Buffer if on).
2. Quantity input and “Over Limit” text turn red.
3. Button shows **“Proceed (Overbooked)”** in red with warning icon.
4. User can still click it; component emits **On Overbooking** then **On Booking**.
5. App can allow or block overbooking in Supabase or business logic.

---

## 6. UI Elements Summary

### Left panel (70%)

- **Header**: “Booking Cart”, subtitle (“Drafting New Order” / “Modifying Order #BN-xxx”), “X Items”
- **Empty state**: Cart icon + “Add items manually or from the list below”
- **Table**: IMAGE | PRODUCT DETAILS (Model, Color · Size, SKU) | AVAILABILITY | ORDER QTY (input; red + “Over Limit” when over) | Remove (trash)

### Right panel (20%)

- **EXISTING BOOKING**: Dropdown “Select Booking ID...”, Connect (chain) or Disconnect (X) icon
- **QUICK ADD SKU**: X clear button, input “Scan or type SKU...”, blue Add arrow; “No Match Found” on error
- **Booking Title**: Document icon, input placeholder “e.g. Q4 Internal Event”
- **Person In Charge**: Person icon, dropdown “Select Teammate.....”
- **Confirm**: “Confirm Booking” (blue) or “Proceed (Overbooked)” (red); disabled if no title or PIC
- **Disclaimer**: “*Stock reserved upon confirmation.”

---

## 7. Database Context (Reference)

- **Booking_Headers**: `id`, `BookingNumber`, `created_at`, `BookingTitle`, `PIC_ID`
- **Booking_Items**: `id`, `HeaderID`, `SKU`, `Quantity`, `Status`, `updated_at`
- **Inventory_Data**: `SKU`, `Model`, `Color`, `Size`, `SNT`, `ImageLink`
- **Teammates**: `id`, `Name`

---

This document reflects the current implementation of the Inventory Booking Cart component.

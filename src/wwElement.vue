<template>
  <div class="inv-booking-cart" :style="rootStyle">
    <!-- Left panel: Booking Cart items -->
    <div class="inv-booking-cart__left">
      <div class="inv-booking-cart__header">
        <h2 class="inv-booking-cart__title">Booking Cart</h2>
        <p class="inv-booking-cart__subtitle">{{ cartSubtitle }}</p>
        <span class="inv-booking-cart__count">{{ cartRows.length }} Items</span>
      </div>
      <!-- Manual add SKU (compact) -->
      <div class="inv-booking-cart__add-sku">
        <input
          v-model="manualSkuInput"
          type="text"
          class="inv-booking-cart__input"
          :placeholder="content.manualSkuPlaceholder || 'Add SKU by code, press Enter'"
          :style="inputStyle"
          @keydown.enter="onManualAddSku"
        />
        <span v-if="manualSkuError" class="inv-booking-cart__error">No Match Found</span>
      </div>
      <div v-if="!cartRows.length" class="inv-booking-cart__empty">Cart is empty. Add SKUs above or from the inventory list.</div>
      <div v-else class="inv-booking-cart__table-wrap">
        <table class="inv-booking-cart__table">
          <thead>
            <tr>
              <th class="inv-booking-cart__th inv-booking-cart__th--img">IMAGE</th>
              <th class="inv-booking-cart__th">PRODUCT DETAILS</th>
              <th class="inv-booking-cart__th inv-booking-cart__th--avail">AVAILABILITY</th>
              <th class="inv-booking-cart__th inv-booking-cart__th--qty">ORDER QTY</th>
              <th class="inv-booking-cart__th inv-booking-cart__th--action"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in cartRows"
              :key="row.sku + '-' + index"
              class="inv-booking-cart__tr"
            >
              <td class="inv-booking-cart__td inv-booking-cart__td--img">
                <div class="inv-booking-cart__row-img-wrap">
                  <img
                    v-if="row.ref && row.ref.ImageLink"
                    :src="row.ref.ImageLink"
                    :alt="row.ref.Model"
                    class="inv-booking-cart__row-img"
                  />
                  <div v-else class="inv-booking-cart__row-img-placeholder">No image</div>
                </div>
              </td>
              <td class="inv-booking-cart__td inv-booking-cart__td--details">
                <div class="inv-booking-cart__model">{{ row.ref ? row.ref.Model : '—' }}</div>
                <div class="inv-booking-cart__color-size">{{ productDetailLine(row) }}</div>
                <div class="inv-booking-cart__sku">{{ row.sku }}</div>
              </td>
              <td class="inv-booking-cart__td inv-booking-cart__td--avail" :style="availStyle(row)">
                {{ row.available }}
              </td>
              <td class="inv-booking-cart__td inv-booking-cart__td--qty">
                <input
                  :value="row.quantity"
                  type="number"
                  min="1"
                  class="inv-booking-cart__qty-input"
                  :style="inputStyle"
                  @input="onQtyInput(row.sku, $event)"
                />
              </td>
              <td class="inv-booking-cart__td inv-booking-cart__td--action">
                <button
                  type="button"
                  class="inv-booking-cart__btn-trash"
                  title="Remove"
                  @click="removeFromCart(row.sku)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Right panel: Load / Booking details / Summary / Confirm -->
    <div class="inv-booking-cart__right">
      <div class="inv-booking-cart__right-inner">
        <button
          type="button"
          class="inv-booking-cart__btn-load"
          :style="inputStyle"
          @click="focusEditDropdown"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          LOAD EXISTING ORDER
        </button>
        <input
          v-model="editBookingSearch"
          type="text"
          class="inv-booking-cart__input inv-booking-cart__search"
          placeholder="Search by number, title, PIC..."
          :style="inputStyle"
        />
        <div class="inv-booking-cart__dropdown-wrap">
          <select
            ref="editSelectRef"
            :value="selectedEditHeaderId"
            class="inv-booking-cart__select inv-booking-cart__select--edit"
            :style="inputStyle"
            @change="onSelectEditBooking($event)"
          >
            <option value="">— Create New Booking —</option>
            <option
              v-for="opt in filteredEditOptions"
              :key="opt.id"
              :value="opt.id"
            >
              {{ opt.display }}
            </option>
          </select>
          <span class="inv-booking-cart__dropdown-icon" aria-hidden="true">⋮</span>
        </div>
        <div class="inv-booking-cart__field">
          <label class="inv-booking-cart__field-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Booking Title
          </label>
          <input
            v-model="bookingTitle"
            type="text"
            class="inv-booking-cart__input"
            placeholder="e.g. Q4 Internal Event"
            :style="inputStyle"
          />
        </div>
        <div class="inv-booking-cart__field">
          <label class="inv-booking-cart__field-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Person In Charge
          </label>
          <select
            v-model="bookingPicId"
            class="inv-booking-cart__select"
            :style="inputStyle"
          >
            <option value="">Select Teammate...</option>
            <option
              v-for="t in teammates"
              :key="t.id"
              :value="t.id"
            >
              {{ t.Name || t.name || '—' }}
            </option>
          </select>
        </div>
        <div class="inv-booking-cart__summary">
          <div class="inv-booking-cart__summary-row">
            <span>Total Items</span>
            <span>{{ cartRows.length }} SKUs</span>
          </div>
          <div class="inv-booking-cart__summary-row">
            <span>Total Units</span>
            <span>{{ totalUnits }} Units</span>
          </div>
        </div>
        <button
          type="button"
          class="inv-booking-cart__btn-confirm"
          :class="{ 'inv-booking-cart__btn-confirm--overbook': isOverbooking }"
          :style="proceedButtonStyle"
          :disabled="!canProceed"
          @click="onProceed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {{ confirmButtonText }}
        </button>
        <p class="inv-booking-cart__disclaimer">*Stock reserved upon confirmation.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

function toKLTimestamp() {
  return new Date().toISOString();
}

function normalizeCollection(raw) {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((row) => (row && row.value != null ? row.value : row));
}

function getSku(item) {
  if (item == null) return '';
  if (typeof item === 'string') return item.trim();
  return (item.SKU ?? item.sku) ?? '';
}

function getQty(item) {
  if (item == null) return 1;
  if (typeof item === 'string') return 1;
  const q = item.Quantity ?? item.quantity;
  const n = Number(q);
  return Number.isNaN(n) || n < 1 ? 1 : Math.floor(n);
}

/** Normalize cart for emit: always [{ SKU, Quantity }, ...] */
function cartToEmit(items) {
  return (items || []).map((item) => ({
    SKU: getSku(item),
    Quantity: getQty(item),
  }));
}

export default {
  name: 'InvBookingCart',
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {
    const manualSkuInput = ref('');
    const manualSkuError = ref(false);
    const bookingTitle = ref('');
    const bookingPicId = ref('');
    const editBookingSearch = ref('');
    const selectedEditHeaderId = ref('');
    const editSelectRef = ref(null);

    const reference = computed(() => {
      const raw = wwLib.wwUtils.getDataFromCollection(props.content.referenceData);
      return normalizeCollection(raw);
    });

    const cartRaw = computed(() => {
      const raw = wwLib.wwUtils.getDataFromCollection(props.content.cartData);
      return normalizeCollection(raw);
    });

    const buffer = computed(() => props.content.buffer === true);

    const referenceBySku = computed(() => {
      const map = {};
      reference.value.forEach((row) => {
        const sku = getSku(row);
        if (sku) map[sku] = row;
      });
      return map;
    });

    const availableQty = (refRow) => {
      const n = Number(refRow?.SNT ?? refRow?.snt ?? 0);
      const val = Number.isNaN(n) ? 0 : n;
      return buffer.value ? Math.max(0, val - 25) : val;
    };

    const cartRows = computed(() => {
      return cartRaw.value.map((item) => {
        const sku = getSku(item);
        const quantity = getQty(item);
        const refRow = referenceBySku.value[sku];
        return {
          sku,
          quantity,
          ref: refRow || null,
          available: refRow != null ? availableQty(refRow) : 0,
        };
      });
    });

    const teammates = computed(() => {
      const raw = wwLib.wwUtils.getDataFromCollection(props.content.teammatesList);
      return normalizeCollection(raw);
    });

    const bookingHeaders = computed(() => {
      const raw = wwLib.wwUtils.getDataFromCollection(props.content.bookingHeaders);
      return normalizeCollection(raw);
    });

    const bookingItems = computed(() => {
      const raw = wwLib.wwUtils.getDataFromCollection(props.content.bookingItems);
      return normalizeCollection(raw);
    });

    const teammatesById = computed(() => {
      const map = {};
      teammates.value.forEach((t) => {
        const id = t.id;
        if (id) map[id] = t;
      });
      return map;
    });

    const editOptions = computed(() => {
      return bookingHeaders.value.map((h) => {
        const pic = teammatesById.value[h.PIC_ID || h.pic_id];
        const picName = pic ? (pic.Name || pic.name || '') : '';
        const num = h.BookingNumber || h.bookingNumber || '';
        const title = h.BookingTitle || h.bookingTitle || '';
        const display = [num, title, picName].filter(Boolean).join(' · ') || h.id;
        return { id: h.id, ...h, display, picName };
      });
    });

    const filteredEditOptions = computed(() => {
      const q = (editBookingSearch.value || '').toLowerCase().trim();
      if (!q) return editOptions.value;
      return editOptions.value.filter(
        (o) =>
          (o.BookingNumber || '').toLowerCase().includes(q) ||
          (o.BookingTitle || '').toLowerCase().includes(q) ||
          (o.picName || '').toLowerCase().includes(q)
      );
    });

    const canProceed = computed(() => {
      const hasTitle = (bookingTitle.value || '').trim().length > 0;
      const hasPic = (bookingPicId.value || '').trim().length > 0;
      return hasTitle && hasPic;
    });

    const isOverbooking = computed(() => {
      return cartRows.value.some((row) => row.quantity > row.available);
    });

    const proceedButtonText = computed(() => {
      return isOverbooking.value
        ? (props.content.proceedOverbookingText || 'Proceed Overbooking')
        : (props.content.proceedButtonText || 'Proceed');
    });

    const confirmButtonText = computed(() => {
      return isOverbooking.value
        ? (props.content.proceedOverbookingText || 'Confirm Overbooking')
        : (props.content.proceedButtonText || 'Confirm Booking');
    });

    const totalUnits = computed(() => {
      return cartRows.value.reduce((sum, row) => sum + row.quantity, 0);
    });

    const cartSubtitle = computed(() => {
      const id = (props.content.editingHeaderId || '').trim();
      if (!id) return 'Drafting New Order';
      const header = bookingHeaders.value.find((h) => h.id === id);
      const num = header ? (header.BookingNumber || header.bookingNumber || '') : '';
      return num ? `Editing ${num}` : 'Drafting New Order';
    });

    function onManualAddSku() {
      /* wwEditor:start */
      if (props.wwEditorState?.editMode === wwLib?.wwEditorHelper?.EDIT_MODES?.EDITION) return;
      /* wwEditor:end */
      manualSkuError.value = false;
      const sku = (manualSkuInput.value || '').trim();
      if (!sku) return;
      const refRow = referenceBySku.value[sku];
      if (refRow) {
        emit('trigger-event', {
          name: 'manualAddSku',
          event: { value: refRow },
        });
        manualSkuInput.value = '';
      } else {
        manualSkuError.value = true;
      }
    }

    function buildCart() {
      return cartToEmit(cartRaw.value);
    }

    function removeFromCart(sku) {
      /* wwEditor:start */
      if (props.wwEditorState?.editMode === wwLib?.wwEditorHelper?.EDIT_MODES?.EDITION) return;
      /* wwEditor:end */
      const next = cartRaw.value.filter((item) => getSku(item) !== sku);
      emit('trigger-event', { name: 'removeFromCart', event: { cart: cartToEmit(next) } });
    }

    function onQtyInput(sku, ev) {
      /* wwEditor:start */
      if (props.wwEditorState?.editMode === wwLib?.wwEditorHelper?.EDIT_MODES?.EDITION) return;
      /* wwEditor:end */
      const v = parseInt(ev.target.value, 10);
      const qty = Number.isNaN(v) || v < 1 ? 1 : v;
      const next = cartRaw.value.map((item) =>
        getSku(item) === sku ? { SKU: getSku(item), Quantity: qty } : { SKU: getSku(item), Quantity: getQty(item) }
      );
      emit('trigger-event', { name: 'qtyChange', event: { cart: next } });
    }

    function moveCartItem(fromIndex, delta) {
      /* wwEditor:start */
      if (props.wwEditorState?.editMode === wwLib?.wwEditorHelper?.EDIT_MODES?.EDITION) return;
      /* wwEditor:end */
      const arr = cartToEmit(cartRaw.value);
      const toIndex = fromIndex + delta;
      if (toIndex < 0 || toIndex >= arr.length) return;
      [arr[fromIndex], arr[toIndex]] = [arr[toIndex], arr[fromIndex]];
      emit('trigger-event', { name: 'reorderCart', event: { cart: arr } });
    }

    function onSelectEditBooking(ev) {
      /* wwEditor:start */
      if (props.wwEditorState?.editMode === wwLib?.wwEditorHelper?.EDIT_MODES?.EDITION) return;
      /* wwEditor:end */
      const headerId = (ev.target && ev.target.value) || '';
      selectedEditHeaderId.value = headerId;
      if (!headerId) {
        emit('trigger-event', {
          name: 'loadBooking',
          event: {
            headerId: null,
            bookingNumber: '',
            bookingTitle: '',
            picId: '',
            cart: [],
          },
        });
        bookingTitle.value = '';
        bookingPicId.value = '';
        return;
      }
      const header = bookingHeaders.value.find((h) => h.id === headerId);
      if (!header) return;
      const items = bookingItems.value
        .filter((bi) => (bi.HeaderID || bi.headerId) === headerId)
        .map((bi) => ({
          SKU: bi.SKU || bi.sku || '',
          Quantity: Math.max(1, Number(bi.Quantity ?? bi.quantity) || 1),
        }));
      bookingTitle.value = header.BookingTitle || header.bookingTitle || '';
      bookingPicId.value = header.PIC_ID || header.pic_id || '';
      emit('trigger-event', {
        name: 'loadBooking',
        event: {
          headerId: header.id,
          bookingNumber: header.BookingNumber || header.bookingNumber || '',
          bookingTitle: header.BookingTitle || header.bookingTitle || '',
          picId: header.PIC_ID || header.pic_id || '',
          cart: items,
        },
      });
    }

    function focusEditDropdown() {
      if (editSelectRef.value) editSelectRef.value.focus();
    }

    function onProceed() {
      /* wwEditor:start */
      if (props.wwEditorState?.editMode === wwLib?.wwEditorHelper?.EDIT_MODES?.EDITION) return;
      /* wwEditor:end */
      if (!canProceed.value) return;
      const editingId = (props.content.editingHeaderId || '').trim() || null;
      const header = editingId ? bookingHeaders.value.find((h) => h.id === editingId) : null;
      const now = toKLTimestamp();
      const bookingNumber = header
        ? (header.BookingNumber || header.bookingNumber || '')
        : 'BN-' + String(Date.now()).slice(-6);
      emit('trigger-event', {
        name: 'booked',
        event: {
          value: {
            isEdit: !!editingId,
            headerId: editingId,
            created_at: header ? (header.created_at || now) : now,
            updated_at: now,
            pic_uuid: bookingPicId.value || '',
            BookingNumber: bookingNumber,
            BookingItems: buildCart(),
          },
        },
      });
    }

    watch(
      () => props.content.editingHeaderId,
      (v) => {
        selectedEditHeaderId.value = (v || '').trim();
      },
      { immediate: true }
    );

    return {
      reference,
      manualSkuInput,
      manualSkuError,
      bookingTitle,
      bookingPicId,
      editBookingSearch,
      selectedEditHeaderId,
      editSelectRef,
      cartRows,
      teammates,
      filteredEditOptions,
      canProceed,
      isOverbooking,
      proceedButtonText,
      confirmButtonText,
      totalUnits,
      cartSubtitle,
      onManualAddSku,
      removeFromCart,
      onQtyInput,
      moveCartItem,
      onSelectEditBooking,
      onProceed,
      focusEditDropdown,
    };
  },
  computed: {
    productDetailLine() {
      return (row) => {
        if (!row.ref) return '—';
        const color = row.ref.Color || row.ref.color || '';
        const size = row.ref.Size || row.ref.size || '';
        return [color, size].filter(Boolean).join(' · ') || '—';
      };
    },
    rootStyle() {
      const c = this.content;
      return {
        '--inv-font-size': '12px',
        '--inv-cell-bg': c.cellColor || '#ffffff',
        '--inv-text-color': c.textColor || '#1e293b',
        '--inv-radius': c.borderRadius || '8px',
        '--inv-input-border': (c.inputBorderColor || '#e2e8f0') + ' 1px solid',
        '--inv-btn-color': c.buttonColor || '#2563eb',
      };
    },
    inputStyle() {
      return {
        border: 'var(--inv-input-border)',
        borderRadius: 'var(--inv-radius)',
      };
    },
    rowStyle() {
      return {
        backgroundColor: 'var(--inv-cell-bg)',
        color: 'var(--inv-text-color)',
        borderRadius: 'var(--inv-radius)',
      };
    },
    availStyle() {
      return (row) => {
        if (row.available <= 0) return { color: '#dc2626' };
        return {};
      };
    },
    proceedButtonStyle() {
      const c = this.content;
      const base = { backgroundColor: 'var(--inv-btn-color)' };
      if (this.isOverbooking) return { ...base, color: '#fff', borderColor: '#dc2626' };
      return base;
    },
  },
  methods: {
    /* wwEditor:start */
    getManualAddSkuTestEvent() {
      const ref = this.reference;
      const first = Array.isArray(ref) && ref[0];
      return { value: first || { SKU: '', Model: '', Color: '', SNT: 0, ImageLink: '' } };
    },
    getCartUpdateTestEvent() {
      return { cart: [{ SKU: 'SAMPLE', Quantity: 1 }] };
    },
    getLoadBookingTestEvent() {
      return {
        headerId: '',
        bookingNumber: 'BN-123456',
        bookingTitle: 'Sample',
        picId: '',
        cart: [{ SKU: 'SAMPLE', Quantity: 1 }],
      };
    },
    getBookedTestEvent() {
      return {
        value: {
          isEdit: false,
          headerId: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          pic_uuid: '',
          BookingNumber: 'BN-123456',
          BookingItems: [{ SKU: 'SAMPLE', Quantity: 1 }],
        },
      };
    },
    /* wwEditor:end */
  },
};
</script>

<style scoped>
.inv-booking-cart {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--inv-text-color);
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: 320px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.inv-booking-cart__left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e2e8f0;
}

.inv-booking-cart__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 16px;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.inv-booking-cart__title {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
  margin: 0;
  color: var(--inv-text-color);
}

.inv-booking-cart__subtitle {
  font-size: 12px;
  font-weight: 400;
  color: #64748b;
  margin: 0;
}

.inv-booking-cart__count {
  margin-left: auto;
  font-size: 12px;
  color: #64748b;
}

.inv-booking-cart__add-sku {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.inv-booking-cart__add-sku .inv-booking-cart__input {
  flex: 1;
  min-width: 0;
}

.inv-booking-cart__input {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  padding: 8px 10px;
  color: var(--inv-text-color);
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.inv-booking-cart__input:focus {
  outline: none;
  border-color: var(--inv-btn-color);
}

.inv-booking-cart__error {
  color: #dc2626;
  font-size: 12px;
  font-weight: 500;
}

.inv-booking-cart__empty {
  padding: 24px 16px;
  text-align: center;
  color: #64748b;
  font-size: 12px;
}

.inv-booking-cart__table-wrap {
  flex: 1;
  overflow: auto;
}

.inv-booking-cart__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.inv-booking-cart__th {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  padding: 10px 12px;
  background: #f1f5f9;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.inv-booking-cart__th--img { width: 80px; }
.inv-booking-cart__th--avail { width: 90px; }
.inv-booking-cart__th--qty { width: 90px; }
.inv-booking-cart__th--action { width: 44px; }

.inv-booking-cart__tr {
  border-bottom: 1px solid #e2e8f0;
}

.inv-booking-cart__tr:hover {
  background: #f8fafc;
}

.inv-booking-cart__td {
  padding: 10px 12px;
  vertical-align: middle;
  font-size: 12px;
}

.inv-booking-cart__td--img { width: 80px; }
.inv-booking-cart__td--avail { width: 90px; text-align: right; }
.inv-booking-cart__td--qty { width: 90px; }
.inv-booking-cart__td--action { width: 44px; }

.inv-booking-cart__row-img-wrap {
  width: 48px;
  height: 48px;
  background: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
}

.inv-booking-cart__row-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.inv-booking-cart__row-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #94a3b8;
  background: #f1f5f9;
}

.inv-booking-cart__model {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
}

.inv-booking-cart__color-size {
  font-size: 12px;
  color: #475569;
  margin-top: 2px;
}

.inv-booking-cart__sku {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.inv-booking-cart__qty-input {
  width: 64px;
  padding: 6px 8px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--inv-text-color);
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.inv-booking-cart__btn-trash {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
}

.inv-booking-cart__btn-trash:hover {
  background: #fef2f2;
  color: #dc2626;
}

.inv-booking-cart__right {
  width: 280px;
  flex-shrink: 0;
  background: #f8fafc;
  border-left: 1px solid #e2e8f0;
}

.inv-booking-cart__right-inner {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inv-booking-cart__btn-load {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
}

.inv-booking-cart__btn-load:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.inv-booking-cart__dropdown-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
}

.inv-booking-cart__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inv-booking-cart__field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
}

.inv-booking-cart__field-label svg {
  flex-shrink: 0;
  color: #64748b;
}

.inv-booking-cart__select {
  width: 100%;
  padding: 10px 12px;
  font-size: 1em;
  font-family: inherit;
  color: var(--inv-text-color);
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
}

.inv-booking-cart__select:focus {
  outline: none;
  border-color: var(--inv-btn-color);
}

.inv-booking-cart__search {
  margin-bottom: 0.5rem;
}

.inv-booking-cart__card--action {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.inv-booking-cart__btn-proceed {
  width: 100%;
  padding: 12px 24px;
  font-size: 1em;
  font-weight: 600;
  font-family: inherit;
  color: #fff;
  background: var(--inv-btn-color);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.15s, background 0.15s;
}

.inv-booking-cart__btn-proceed:hover:not(:disabled) {
  opacity: 0.95;
}

.inv-booking-cart__btn-proceed:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.inv-booking-cart__btn-proceed--overbook {
  color: #fff !important;
  background: #dc2626 !important;
}

.inv-booking-cart__btn-proceed--overbook:hover:not(:disabled) {
  background: #b91c1c !important;
}

.inv-booking-cart__disclaimer {
  margin: 0;
  font-size: 11px;
  font-style: italic;
  color: #94a3b8;
  line-height: 1.4;
}

.inv-booking-cart__summary {
  padding: 12px 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inv-booking-cart__summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--inv-text-color);
}

.inv-booking-cart__summary-row span:last-child {
  font-weight: 600;
}

.inv-booking-cart__select--edit {
  padding-right: 28px;
}

.inv-booking-cart__dropdown-icon {
  font-size: 14px;
  color: #64748b;
  margin-left: -24px;
  pointer-events: none;
}

.inv-booking-cart__btn-confirm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: var(--inv-btn-color);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.inv-booking-cart__btn-confirm:hover:not(:disabled) {
  opacity: 0.95;
}

.inv-booking-cart__btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.inv-booking-cart__btn-confirm--overbook {
  background: #dc2626 !important;
}

.inv-booking-cart__btn-confirm--overbook:hover:not(:disabled) {
  background: #b91c1c !important;
}
</style>

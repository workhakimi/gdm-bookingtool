<template>
  <div class="inv-booking-cart" :style="rootStyle">
    <!-- Left panel: Booking Cart -->
    <div class="inv-booking-cart__left">
      <div class="inv-booking-cart__header">
        <h2 class="inv-booking-cart__title">Booking Cart</h2>
        <p class="inv-booking-cart__subtitle">{{ cartSubtitle }}</p>
        <span class="inv-booking-cart__count">{{ cartRows.length }} Items</span>
      </div>
      <div v-if="!cartRows.length" class="inv-booking-cart__empty">
        <div class="inv-booking-cart__empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
        <p class="inv-booking-cart__empty-text">Add items manually or from the list below</p>
      </div>
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
                <div class="inv-booking-cart__model">{{ productModel(row) }}</div>
                <div v-if="productSize(row)" class="inv-booking-cart__size-line">{{ productSize(row) }}</div>
                <div class="inv-booking-cart__color-size">{{ productColorSize(row) }}</div>
                <div class="inv-booking-cart__sku">{{ row.sku }}</div>
              </td>
              <td class="inv-booking-cart__td inv-booking-cart__td--avail">
                <span class="inv-booking-cart__avail-badge" :class="{ 'inv-booking-cart__avail-badge--zero': row.available <= 0 }">{{ row.available }}</span>
              </td>
              <td class="inv-booking-cart__td inv-booking-cart__td--qty">
                <input
                  :value="row.quantity"
                  type="number"
                  min="1"
                  class="inv-booking-cart__qty-input"
                  :class="{ 'inv-booking-cart__qty-input--over': row.quantity > row.available }"
                  :style="inputStyle"
                  @input="onQtyInput(row.sku, $event)"
                />
                <p v-if="row.quantity > row.available" class="inv-booking-cart__over-limit">Over Limit</p>
              </td>
              <td class="inv-booking-cart__td inv-booking-cart__td--action">
                <button
                  type="button"
                  class="inv-booking-cart__btn-trash"
                  title="Remove from cart"
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

    <!-- Right panel: Existing Booking, Quick Add, Details, Confirm -->
    <div class="inv-booking-cart__right">
      <div class="inv-booking-cart__right-inner">
        <section class="inv-booking-cart__block">
          <h3 class="inv-booking-cart__block-title">EXISTING BOOKING</h3>
          <div class="inv-booking-cart__existing-row">
            <select
              ref="existingSelectRef"
              v-model="selectedBookingId"
              class="inv-booking-cart__select inv-booking-cart__select--existing"
              :style="inputStyle"
            >
              <option value="">Select Booking ID...</option>
              <option
                v-for="opt in filteredEditOptions"
                :key="opt.id"
                :value="opt.id"
              >
                {{ opt.display }}
              </option>
            </select>
            <span class="inv-booking-cart__dropdown-icon">⋮</span>
            <template v-if="!connectedHeaderId">
              <button
                type="button"
                class="inv-booking-cart__btn-connect"
                title="Connect"
                :disabled="!selectedBookingId"
                @click="onConnect"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </button>
            </template>
            <template v-else>
              <button
                type="button"
                class="inv-booking-cart__btn-disconnect"
                title="Disconnect"
                @click="onDisconnect"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              </button>
            </template>
          </div>
        </section>

        <section class="inv-booking-cart__block">
          <h3 class="inv-booking-cart__block-title">QUICK ADD SKU</h3>
          <div class="inv-booking-cart__quick-add-row">
            <input
              v-model="quickAddSku"
              type="text"
              class="inv-booking-cart__input"
              :placeholder="content.quickAddPlaceholder || 'Scan or type SKU...'"
              :style="inputStyle"
              @keydown.enter="onQuickAddSku"
            />
            <button
              type="button"
              class="inv-booking-cart__btn-add-sku"
              title="Add SKU"
              @click="onQuickAddSku"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
          <p v-if="quickAddError" class="inv-booking-cart__error">No Match Found</p>
        </section>

        <section class="inv-booking-cart__block">
          <label class="inv-booking-cart__field-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Booking Title
          </label>
          <input
            v-model="bookingTitle"
            type="text"
            class="inv-booking-cart__input"
            :placeholder="content.bookingTitlePlaceholder || 'e.g. Q4 Internal Event'"
            :style="inputStyle"
          />
        </section>

        <section class="inv-booking-cart__block">
          <label class="inv-booking-cart__field-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Person In Charge
          </label>
          <select
            v-model="bookingPicId"
            class="inv-booking-cart__select"
            :style="inputStyle"
          >
            <option value="">{{ content.picPlaceholder || 'Select Teammate...' }}</option>
            <option
              v-for="t in teammates"
              :key="t.id"
              :value="t.id"
            >
              {{ t.Name || t.name || '—' }}
            </option>
          </select>
        </section>

        <button
          type="button"
          class="inv-booking-cart__btn-confirm"
          :class="{ 'inv-booking-cart__btn-confirm--overbook': isOverbooking }"
          :style="proceedButtonStyle"
          :disabled="!canProceed"
          @click="onProceed"
        >
          <svg v-if="isOverbooking" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
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
    const internalCart = ref([]);
    const connectedHeaderId = ref(null);
    const selectedBookingId = ref('');
    const bookingTitle = ref('');
    const bookingPicId = ref('');
    const quickAddSku = ref('');
    const quickAddError = ref(false);
    const existingSelectRef = ref(null);

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
      return internalCart.value.map((item) => {
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
        if (t.id) map[t.id] = t;
      });
      return map;
    });

    const editOptions = computed(() => {
      return bookingHeaders.value.map((h) => {
        const pic = teammatesById.value[h.PIC_ID || h.pic_id];
        const picName = pic ? (pic.Name || pic.name || '') : '';
        const num = h.BookingNumber || h.bookingNumber || '';
        const title = h.BookingTitle || h.bookingTitle || '';
        const display = [num, title].filter(Boolean).join(' • ') || num || h.id;
        return { id: h.id, ...h, display, picName };
      });
    });

    const filteredEditOptions = computed(() => editOptions.value);

    const canProceed = computed(() => {
      const hasTitle = (bookingTitle.value || '').trim().length > 0;
      const hasPic = (bookingPicId.value || '').trim().length > 0;
      return hasTitle && hasPic;
    });

    const isOverbooking = computed(() => {
      return cartRows.value.some((row) => row.quantity > row.available);
    });

    const confirmButtonText = computed(() => {
      return isOverbooking.value
        ? (props.content.proceedOverbookingText || 'Proceed (Overbooked)')
        : (props.content.confirmButtonText || 'Confirm Booking');
    });

    const cartSubtitle = computed(() => {
      if (!connectedHeaderId.value) return 'Drafting New Order';
      const header = bookingHeaders.value.find((h) => h.id === connectedHeaderId.value);
      const num = header ? (header.BookingNumber || header.bookingNumber || '') : '';
      return num ? `Modifying Order #${num}` : 'Drafting New Order';
    });

    watch(
      () => cartRaw.value,
      (next) => {
        if (!connectedHeaderId.value) {
          internalCart.value = cartToEmit(next);
        }
      },
      { immediate: true, deep: true }
    );

    function onConnect() {
      /* wwEditor:start */
      if (props.wwEditorState?.editMode === wwLib?.wwEditorHelper?.EDIT_MODES?.EDITION) return;
      /* wwEditor:end */
      const headerId = selectedBookingId.value;
      if (!headerId) return;
      const header = bookingHeaders.value.find((h) => h.id === headerId);
      if (!header) return;
      const items = bookingItems.value
        .filter((bi) => (bi.HeaderID || bi.headerId) === headerId)
        .map((bi) => ({
          SKU: bi.SKU || bi.sku || '',
          Quantity: Math.max(1, Number(bi.Quantity ?? bi.quantity) || 1),
        }));
      internalCart.value = items;
      connectedHeaderId.value = header.id;
      bookingTitle.value = header.BookingTitle || header.bookingTitle || '';
      bookingPicId.value = header.PIC_ID || header.pic_id || '';
    }

    function onDisconnect() {
      /* wwEditor:start */
      if (props.wwEditorState?.editMode === wwLib?.wwEditorHelper?.EDIT_MODES?.EDITION) return;
      /* wwEditor:end */
      connectedHeaderId.value = null;
      internalCart.value = [];
      bookingTitle.value = '';
      bookingPicId.value = '';
      selectedBookingId.value = '';
    }

    function onQuickAddSku() {
      /* wwEditor:start */
      if (props.wwEditorState?.editMode === wwLib?.wwEditorHelper?.EDIT_MODES?.EDITION) return;
      /* wwEditor:end */
      quickAddError.value = false;
      const sku = (quickAddSku.value || '').trim();
      if (!sku) return;
      const refRow = referenceBySku.value[sku];
      if (refRow) {
        internalCart.value = [...internalCart.value, { SKU: sku, Quantity: 1 }];
        quickAddSku.value = '';
      } else {
        quickAddError.value = true;
      }
    }

    function removeFromCart(sku) {
      /* wwEditor:start */
      if (props.wwEditorState?.editMode === wwLib?.wwEditorHelper?.EDIT_MODES?.EDITION) return;
      /* wwEditor:end */
      const next = internalCart.value.filter((item) => getSku(item) !== sku);
      internalCart.value = next;
      emit('trigger-event', { name: 'removeFromCart', event: { cart: cartToEmit(next) } });
    }

    function onQtyInput(sku, ev) {
      /* wwEditor:start */
      if (props.wwEditorState?.editMode === wwLib?.wwEditorHelper?.EDIT_MODES?.EDITION) return;
      /* wwEditor:end */
      const v = parseInt(ev.target.value, 10);
      const qty = Number.isNaN(v) || v < 1 ? 1 : v;
      internalCart.value = internalCart.value.map((item) =>
        getSku(item) === sku ? { SKU: getSku(item), Quantity: qty } : { SKU: getSku(item), Quantity: getQty(item) }
      );
    }

    function onProceed() {
      /* wwEditor:start */
      if (props.wwEditorState?.editMode === wwLib?.wwEditorHelper?.EDIT_MODES?.EDITION) return;
      /* wwEditor:end */
      if (!canProceed.value) return;
      const header = connectedHeaderId.value ? bookingHeaders.value.find((h) => h.id === connectedHeaderId.value) : null;
      const now = toKLTimestamp();
      const bookingNumber = header
        ? (header.BookingNumber || header.bookingNumber || '')
        : 'BN-' + String(Date.now()).slice(-6);
      if (isOverbooking.value) {
        emit('trigger-event', { name: 'overbooking', event: { value: { overbooked: true } } });
      }
      emit('trigger-event', {
        name: 'booked',
        event: {
          value: {
            isEdit: !!connectedHeaderId.value,
            headerId: connectedHeaderId.value,
            created_at: header ? (header.created_at || now) : now,
            updated_at: now,
            pic_uuid: bookingPicId.value || '',
            BookingNumber: bookingNumber,
            BookingItems: cartToEmit(internalCart.value),
          },
        },
      });
    }

    return {
      internalCart,
      connectedHeaderId,
      selectedBookingId,
      bookingTitle,
      bookingPicId,
      quickAddSku,
      quickAddError,
      existingSelectRef,
      cartRows,
      teammates,
      filteredEditOptions,
      canProceed,
      isOverbooking,
      confirmButtonText,
      cartSubtitle,
      onConnect,
      onDisconnect,
      onQuickAddSku,
      removeFromCart,
      onQtyInput,
      onProceed,
    };
  },
  computed: {
    productModel() {
      return (row) => (row.ref ? (row.ref.Model || '—') : 'Unknown Item');
    },
    productSize() {
      return (row) => (row.ref ? (row.ref.Size || row.ref.size || '') : '—');
    },
    productColorSize() {
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
    proceedButtonStyle() {
      const c = this.content;
      if (this.isOverbooking) return { backgroundColor: '#dc2626', color: '#fff' };
      return { backgroundColor: 'var(--inv-btn-color)', color: '#fff' };
    },
  },
  methods: {
    /* wwEditor:start */
    getCartUpdateTestEvent() {
      return { cart: [{ SKU: 'SAMPLE', Quantity: 1 }] };
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
    getOverbookingTestEvent() {
      return { value: { overbooked: true } };
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
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
}

.inv-booking-cart__empty-icon {
  color: #cbd5e1;
  margin-bottom: 12px;
}

.inv-booking-cart__empty-text {
  margin: 0;
  font-size: 12px;
  color: #64748b;
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

.inv-booking-cart__avail-badge {
  display: inline-block;
  padding: 4px 10px;
  font-size: 12px;
  background: #f1f5f9;
  border-radius: 6px;
  min-width: 44px;
  text-align: right;
}

.inv-booking-cart__avail-badge--zero {
  background: #fef2f2;
  color: #dc2626;
}

.inv-booking-cart__qty-input--over {
  border-color: #dc2626 !important;
  color: #dc2626;
}

.inv-booking-cart__over-limit {
  margin: 4px 0 0 0;
  font-size: 11px;
  color: #dc2626;
}

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

.inv-booking-cart__size-line {
  font-size: 12px;
  color: var(--inv-text-color);
  margin-top: 2px;
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

.inv-booking-cart__block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inv-booking-cart__block-title {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #64748b;
  margin: 0;
}

.inv-booking-cart__existing-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.inv-booking-cart__select--existing {
  flex: 1;
  min-width: 0;
}

.inv-booking-cart__btn-connect,
.inv-booking-cart__btn-disconnect {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  color: #475569;
  cursor: pointer;
  flex-shrink: 0;
}

.inv-booking-cart__btn-connect:hover:not(:disabled) {
  border-color: var(--inv-btn-color);
  color: var(--inv-btn-color);
}

.inv-booking-cart__btn-connect:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.inv-booking-cart__btn-disconnect:hover {
  border-color: #dc2626;
  color: #dc2626;
  background: #fef2f2;
}

.inv-booking-cart__quick-add-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inv-booking-cart__quick-add-row .inv-booking-cart__input {
  flex: 1;
  min-width: 0;
}

.inv-booking-cart__btn-add-sku {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: var(--inv-btn-color);
  color: #fff;
  cursor: pointer;
  flex-shrink: 0;
}

.inv-booking-cart__btn-add-sku:hover {
  opacity: 0.9;
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

<template>
  <div class="inv-booking-cart" :style="rootStyle">
    <!-- Manual add SKU -->
    <div class="inv-booking-cart__section">
      <label class="inv-booking-cart__label">Add SKU</label>
      <div class="inv-booking-cart__manual-row">
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
    </div>

    <!-- Cart list -->
    <div class="inv-booking-cart__section">
      <label class="inv-booking-cart__label">Cart</label>
      <div v-if="!cartRows.length" class="inv-booking-cart__empty">Cart is empty. Add SKUs above or from the list.</div>
      <div v-else class="inv-booking-cart__list">
        <div
          v-for="(row, index) in cartRows"
          :key="row.sku + '-' + index"
          class="inv-booking-cart__row"
          :style="rowStyle"
        >
          <div class="inv-booking-cart__row-actions">
            <button
              type="button"
              class="inv-booking-cart__btn-icon"
              title="Move up"
              :disabled="index === 0"
              @click="moveCartItem(index, -1)"
            >
              ↑
            </button>
            <button
              type="button"
              class="inv-booking-cart__btn-icon"
              title="Move down"
              :disabled="index === cartRows.length - 1"
              @click="moveCartItem(index, 1)"
            >
              ↓
            </button>
            <button
              type="button"
              class="inv-booking-cart__btn-icon inv-booking-cart__btn-remove"
              title="Remove"
              @click="removeFromCart(row.sku)"
            >
              ×
            </button>
          </div>
          <div class="inv-booking-cart__row-img-wrap">
            <img
              v-if="row.ref && row.ref.ImageLink"
              :src="row.ref.ImageLink"
              :alt="row.ref.Model"
              class="inv-booking-cart__row-img"
            />
            <div v-else class="inv-booking-cart__row-img-placeholder">No image</div>
          </div>
          <div class="inv-booking-cart__row-info">
            <div class="inv-booking-cart__model">{{ row.ref ? row.ref.Model : '—' }}</div>
            <div class="inv-booking-cart__color">{{ row.ref ? row.ref.Color : '—' }}</div>
            <div class="inv-booking-cart__avail" :style="availStyle(row)">
              {{ row.available }} Available
            </div>
          </div>
          <div class="inv-booking-cart__qty-wrap">
            <label class="inv-booking-cart__qty-label">Qty</label>
            <input
              :value="row.quantity"
              type="number"
              min="1"
              class="inv-booking-cart__qty-input"
              :style="inputStyle"
              @input="onQtyInput(row.sku, $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Booking form -->
    <div class="inv-booking-cart__section">
      <label class="inv-booking-cart__label">Booking details</label>
      <div class="inv-booking-cart__form">
        <div class="inv-booking-cart__field">
          <label class="inv-booking-cart__field-label">Title</label>
          <input
            v-model="bookingTitle"
            type="text"
            class="inv-booking-cart__input"
            :placeholder="content.bookingTitlePlaceholder || 'Booking title'"
            :style="inputStyle"
          />
        </div>
        <div class="inv-booking-cart__field">
          <label class="inv-booking-cart__field-label">PIC</label>
          <select
            v-model="bookingPicId"
            class="inv-booking-cart__select"
            :style="inputStyle"
          >
            <option value="">{{ content.picPlaceholder || 'Select PIC' }}</option>
            <option
              v-for="t in teammates"
              :key="t.id"
              :value="t.id"
            >
              {{ t.Name || t.name || '—' }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Edit booking -->
    <div class="inv-booking-cart__section">
      <label class="inv-booking-cart__label">Edit existing booking</label>
      <input
        v-model="editBookingSearch"
        type="text"
        class="inv-booking-cart__input inv-booking-cart__search"
        placeholder="Search by number, title, PIC..."
        :style="inputStyle"
      />
      <select
        :value="selectedEditHeaderId"
        class="inv-booking-cart__select"
        :style="inputStyle"
        @change="onSelectEditBooking($event)"
      >
        <option value="">— New booking —</option>
        <option
          v-for="opt in filteredEditOptions"
          :key="opt.id"
          :value="opt.id"
        >
          {{ opt.display }}
        </option>
      </select>
    </div>

    <!-- Proceed -->
    <div class="inv-booking-cart__section inv-booking-cart__proceed-wrap">
      <button
        type="button"
        class="inv-booking-cart__btn-proceed"
        :class="{ 'inv-booking-cart__btn-proceed--overbook': isOverbooking }"
        :style="proceedButtonStyle"
        :disabled="!canProceed"
        @click="onProceed"
      >
        {{ proceedButtonText }}
      </button>
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
  return (item && (item.SKU ?? item.sku)) ?? '';
}

function getQty(item) {
  const q = item?.Quantity ?? item?.quantity;
  const n = Number(q);
  return Number.isNaN(n) || n < 1 ? 1 : Math.floor(n);
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
      return cartRaw.value.map((item) => ({
        SKU: getSku(item),
        Quantity: getQty(item),
      }));
    }

    function removeFromCart(sku) {
      /* wwEditor:start */
      if (props.wwEditorState?.editMode === wwLib?.wwEditorHelper?.EDIT_MODES?.EDITION) return;
      /* wwEditor:end */
      const next = cartRaw.value.filter((item) => getSku(item) !== sku);
      emit('trigger-event', { name: 'removeFromCart', event: { cart: next } });
    }

    function onQtyInput(sku, ev) {
      /* wwEditor:start */
      if (props.wwEditorState?.editMode === wwLib?.wwEditorHelper?.EDIT_MODES?.EDITION) return;
      /* wwEditor:end */
      const v = parseInt(ev.target.value, 10);
      const qty = Number.isNaN(v) || v < 1 ? 1 : v;
      const next = cartRaw.value.map((item) =>
        getSku(item) === sku ? { ...item, Quantity: qty, quantity: qty } : item
      );
      emit('trigger-event', { name: 'qtyChange', event: { cart: next } });
    }

    function moveCartItem(fromIndex, delta) {
      /* wwEditor:start */
      if (props.wwEditorState?.editMode === wwLib?.wwEditorHelper?.EDIT_MODES?.EDITION) return;
      /* wwEditor:end */
      const arr = [...cartRaw.value];
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
      cartRows,
      teammates,
      filteredEditOptions,
      canProceed,
      isOverbooking,
      proceedButtonText,
      onManualAddSku,
      removeFromCart,
      onQtyInput,
      moveCartItem,
      onSelectEditBooking,
      onProceed,
    };
  },
  computed: {
    rootStyle() {
      const c = this.content;
      const fontSize = Math.max(10, Math.min(24, Number(c.fontSize) || 14));
      return {
        '--inv-font-size': `${fontSize}px`,
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
  font-size: var(--inv-font-size, 14px);
  color: var(--inv-text-color);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 480px;
}

.inv-booking-cart__section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.inv-booking-cart__label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.95em;
}

.inv-booking-cart__manual-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.inv-booking-cart__input {
  flex: 1;
  padding: 8px 10px;
  font-size: 1em;
  font-family: inherit;
  color: inherit;
  background: var(--inv-cell-bg);
}

.inv-booking-cart__error {
  color: #dc2626;
  font-size: 0.9em;
}

.inv-booking-cart__empty {
  padding: 1rem;
  text-align: center;
  color: #64748b;
  font-size: 0.9em;
  background: var(--inv-cell-bg);
  border-radius: var(--inv-radius);
}

.inv-booking-cart__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.inv-booking-cart__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--inv-input-border, #e2e8f0);
}

.inv-booking-cart__row-actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.inv-booking-cart__btn-icon {
  width: 28px;
  height: 24px;
  padding: 0;
  font-size: 14px;
  line-height: 1;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  color: #64748b;
}

.inv-booking-cart__btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.inv-booking-cart__btn-remove {
  color: #dc2626;
}

.inv-booking-cart__row-img-wrap {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
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
}

.inv-booking-cart__row-info {
  flex: 1;
  min-width: 0;
}

.inv-booking-cart__model,
.inv-booking-cart__color {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
}

.inv-booking-cart__color {
  margin-top: 2px;
}

.inv-booking-cart__avail {
  margin-top: 4px;
  font-size: 0.9em;
}

.inv-booking-cart__qty-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.inv-booking-cart__qty-label {
  font-size: 0.75em;
  color: #64748b;
}

.inv-booking-cart__qty-input {
  width: 64px;
  padding: 6px 8px;
  font-size: 1em;
  font-family: inherit;
  color: inherit;
  background: var(--inv-cell-bg);
}

.inv-booking-cart__form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.inv-booking-cart__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.inv-booking-cart__field-label {
  font-size: 0.85em;
  color: #64748b;
}

.inv-booking-cart__select {
  padding: 8px 10px;
  font-size: 1em;
  font-family: inherit;
  color: inherit;
  background: var(--inv-cell-bg);
}

.inv-booking-cart__search {
  margin-bottom: 4px;
}

.inv-booking-cart__proceed-wrap {
  margin-top: 0.5rem;
}

.inv-booking-cart__btn-proceed {
  padding: 10px 20px;
  font-size: 1em;
  font-weight: 600;
  font-family: inherit;
  color: #fff;
  border: none;
  border-radius: var(--inv-radius);
  cursor: pointer;
  transition: opacity 0.15s;
}

.inv-booking-cart__btn-proceed:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.inv-booking-cart__btn-proceed--overbook {
  color: #fff !important;
  background: #dc2626 !important;
}
</style>

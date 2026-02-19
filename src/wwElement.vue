<template>
    <div class="inventory-booking-cart">
        <!-- ═══════════ LEFT PANEL ═══════════ -->
        <div class="left-panel">
            <div class="cart-header">
                <div class="header-info">
                    <h2 class="header-title">Booking Cart</h2>
                    <p class="header-subtitle">{{ subtitle }}</p>
                </div>
                <div class="header-count">
                    <span class="count-divider">|</span>
                    <span class="count-text">{{ itemCount }} Items</span>
                </div>
            </div>

            <!-- Empty state -->
            <div v-if="resolvedCart.length === 0" class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <p class="empty-text">Add items manually or from the list below</p>
            </div>

            <!-- Cart table -->
            <div v-else class="cart-table">
                <div class="table-head">
                    <span class="th th-image">IMAGE</span>
                    <span class="th th-details">PRODUCT DETAILS</span>
                    <span class="th th-avail">AVAILABILITY</span>
                    <span class="th th-qty">ORDER QTY</span>
                    <span class="th th-action"></span>
                </div>
                <div class="table-body">
                    <div
                        v-for="(item, idx) in resolvedCart"
                        :key="item.sku"
                        class="table-row"
                    >
                        <!-- Image -->
                        <div class="td td-image">
                            <img
                                v-if="item.imageLink"
                                :src="item.imageLink"
                                :alt="item.model"
                                class="product-img"
                            />
                            <div v-else class="product-img-placeholder">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                    <line x1="12" y1="22.08" x2="12" y2="12" />
                                </svg>
                            </div>
                        </div>

                        <!-- Product details -->
                        <div class="td td-details">
                            <div class="product-model">{{ item.model }}</div>
                            <div class="product-variant">{{ item.color }} · {{ item.size }}</div>
                            <div class="product-sku">{{ item.sku }}</div>
                        </div>

                        <!-- Availability -->
                        <div class="td td-avail" :class="{ 'is-over': item.isOverLimit }">
                            <span class="avail-number">{{ item.available }}</span>
                            <span v-if="item.isOverLimit" class="over-limit-badge">
                                <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
                                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.5 3.5a.5.5 0 0 1 1 0v4a.5.5 0 0 1-1 0v-4zm.5 7.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z" />
                                </svg>
                                Over Limit
                            </span>
                        </div>

                        <!-- Order quantity -->
                        <div class="td td-qty">
                            <input
                                type="number"
                                class="qty-input"
                                :class="{ 'is-over': item.isOverLimit }"
                                :value="item.quantity"
                                min="0"
                                @change="updateQuantity(idx, $event.target.value)"
                            />
                        </div>

                        <!-- Remove -->
                        <div class="td td-action">
                            <button class="btn-remove" @click="removeItem(idx)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══════════ DIVIDER ═══════════ -->
        <div class="panel-divider"></div>

        <!-- ═══════════ RIGHT PANEL ═══════════ -->
        <div class="right-panel">
            <!-- Existing Booking -->
            <div class="rp-section">
                <label class="rp-label rp-label--caps">
                    <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="23 4 23 10 17 10" />
                        <polyline points="1 20 1 14 7 14" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    EXISTING BOOKING
                </label>
                <div class="existing-booking-row">
                    <div class="custom-select" ref="bookingSelectEl">
                        <button
                            class="select-trigger"
                            :class="{ 'has-value': !!selectedBookingOption }"
                            :disabled="isConnected"
                            @click="toggleBookingDropdown"
                        >
                            <span class="select-text">{{ bookingDropdownDisplay }}</span>
                            <span class="select-dots">···</span>
                        </button>
                        <ul v-if="bookingDropdownOpen" class="select-options">
                            <li class="select-option select-option--placeholder" @mousedown.prevent="selectBooking(null)">
                                Select Booking ID...
                            </li>
                            <li
                                v-for="h in resolvedBookingHeaders"
                                :key="h.id"
                                class="select-option"
                                @mousedown.prevent="selectBooking(h)"
                            >
                                {{ h.BookingNumber }} &bull; {{ h.BookingTitle }}
                            </li>
                        </ul>
                    </div>
                    <button
                        class="btn-connect"
                        :class="{
                            'btn-connect--linked': isConnected,
                            'btn-connect--ready': !isConnected && !!selectedBookingOption,
                        }"
                        :disabled="!isConnected && !selectedBookingOption"
                        @click="isConnected ? disconnectBooking() : connectBooking()"
                    >
                        <!-- Connected: disconnect icon -->
                        <svg v-if="isConnected" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18.84 12.25l1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M5.16 11.75l-1.72 1.71a5 5 0 0 0 7.07 7.07l1.72-1.71" />
                            <line x1="2" y1="2" x2="22" y2="22" />
                        </svg>
                        <!-- Not connected: chain link icon -->
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Quick Add SKU -->
            <div class="rp-section">
                <label class="rp-label rp-label--caps">
                    <button class="label-clear-btn" @click="clearQuickAdd" type="button">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                    QUICK ADD SKU
                </label>
                <div class="quick-add-row">
                    <input
                        v-model="quickAddInput"
                        class="quick-add-input"
                        placeholder="Scan or type SKU..."
                        @keyup.enter="quickAdd"
                    />
                    <button class="btn-quick-add" @click="quickAdd" type="button">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </button>
                </div>
                <p v-if="quickAddError" class="quick-add-error">{{ quickAddError }}</p>
            </div>

            <!-- Booking Title -->
            <div class="rp-section">
                <label class="rp-label">Booking Title</label>
                <div class="input-icon-wrap">
                    <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <input
                        v-model="bookingTitle"
                        class="icon-input"
                        placeholder="e.g. Q4 Internal Event"
                    />
                </div>
            </div>

            <!-- Person In Charge -->
            <div class="rp-section">
                <label class="rp-label">Person In Charge</label>
                <div class="custom-select custom-select--icon" ref="picSelectEl">
                    <button
                        class="select-trigger"
                        :class="{ 'has-value': !!selectedPIC }"
                        @click="togglePICDropdown"
                    >
                        <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span class="select-text">{{ picDropdownDisplay }}</span>
                    </button>
                    <ul v-if="picDropdownOpen" class="select-options">
                        <li class="select-option select-option--placeholder" @mousedown.prevent="selectPIC(null)">
                            Select Teammate...
                        </li>
                        <li
                            v-for="t in resolvedTeammates"
                            :key="t.id"
                            class="select-option"
                            @mousedown.prevent="selectPIC(t)"
                        >
                            {{ t.Name }}
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Confirm -->
            <button
                class="btn-confirm"
                :class="{
                    'btn-confirm--overbooked': hasOverbooking && canConfirm,
                    'btn-confirm--disabled': !canConfirm,
                }"
                :disabled="!canConfirm"
                @click="confirmBooking"
                type="button"
            >
                <!-- Overbooked warning icon -->
                <svg v-if="hasOverbooking && canConfirm" class="confirm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <!-- Normal clock/confirm icon -->
                <svg v-else class="confirm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
                {{ confirmLabel }}
            </button>
            <p class="disclaimer">*Stock reserved upon confirmation</p>
        </div>
    </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

const EMPTY_HEADER = { id: null, BookingNumber: null, created_at: null, BookingTitle: null, PIC_ID: null };

export default {
    props: {
        content: { type: Object, required: true },
        uid: { type: String, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
    emits: ['trigger-event'],
    setup(props, { emit }) {
        // ── Resolve bound collections ──
        const referenceData = computed(() =>
            wwLib.wwUtils.getDataFromCollection(props.content?.referenceData) || []
        );
        const resolvedBookingHeaders = computed(() =>
            wwLib.wwUtils.getDataFromCollection(props.content?.bookingHeaders) || []
        );
        const bookingItemsData = computed(() =>
            wwLib.wwUtils.getDataFromCollection(props.content?.bookingItems) || []
        );
        const resolvedTeammates = computed(() =>
            wwLib.wwUtils.getDataFromCollection(props.content?.teammatesList) || []
        );

        // ── Resolve cartData as a structured object ──
        const cartDataObj = computed(() => {
            const raw = props.content?.cartData;
            if (raw && typeof raw === 'object' && !Array.isArray(raw) && (raw.Booking_Header || raw.Booking_Items)) {
                return raw;
            }
            const resolved = wwLib.wwUtils.getDataFromCollection(raw);
            if (resolved && typeof resolved === 'object' && !Array.isArray(resolved)) {
                return resolved;
            }
            return { Booking_Header: { ...EMPTY_HEADER }, Booking_Items: [] };
        });
        const cartHeader = computed(() => cartDataObj.value?.Booking_Header || {});
        const cartItems = computed(() => cartDataObj.value?.Booking_Items || []);

        // ── UI-only state (form fields + dropdowns) ──
        const bookingTitle = ref('');
        const selectedPIC = ref(null);
        const selectedPICName = ref('');
        const lastSyncedHeaderId = ref(undefined);

        const selectedBookingOption = ref(null);
        const bookingDropdownOpen = ref(false);
        const picDropdownOpen = ref(false);

        const quickAddInput = ref('');
        const quickAddError = ref('');

        const bookingSelectEl = ref(null);
        const picSelectEl = ref(null);

        // ── Derived state from variable ──
        const isConnected = computed(() => !!cartHeader.value?.id);
        const connectedBookingNumber = computed(() => cartHeader.value?.BookingNumber || null);

        // ── Sync title / PIC from header when header ID changes ──
        watch(cartHeader, (header) => {
            const currentId = header?.id || null;
            if (currentId === lastSyncedHeaderId.value) return;

            bookingTitle.value = header?.BookingTitle || '';
            if (header?.PIC_ID) {
                selectedPIC.value = header.PIC_ID;
                const tm = resolvedTeammates.value.find(t => t.id === header.PIC_ID);
                selectedPICName.value = tm ? tm.Name : '';
            } else {
                selectedPIC.value = null;
                selectedPICName.value = '';
            }
            selectedBookingOption.value = (currentId && header?.BookingNumber) ? { ...header } : null;
            lastSyncedHeaderId.value = currentId;
        }, { immediate: true, deep: true });

        // ── Reference data lookup ──
        const refLookup = computed(() => {
            const map = {};
            referenceData.value.forEach(r => { map[r.SKU] = r; });
            return map;
        });

        // ── Resolved cart — reads directly from the variable ──
        const resolvedCart = computed(() => {
            const bufferOn = !!props.content?.buffer;
            return cartItems.value.map(i => {
                const ref = refLookup.value[i.SKU];
                const snt = ref ? (Number(ref.SNT) || 0) : 0;
                const available = bufferOn ? Math.max(0, snt - 25) : snt;
                const qty = i.Quantity != null ? i.Quantity : 0;
                return {
                    sku: i.SKU,
                    quantity: qty,
                    model: ref ? ref.Model : 'Unknown Item',
                    color: ref ? ref.Color : '-',
                    size: ref ? ref.Size : '-',
                    imageLink: ref ? ref.ImageLink : null,
                    available,
                    isOverLimit: qty > available,
                    isUnknown: !ref,
                };
            });
        });

        // ── Computed helpers ──
        const hasOverbooking = computed(() => resolvedCart.value.some(i => i.isOverLimit));
        const canConfirm = computed(() =>
            cartItems.value.length > 0 &&
            bookingTitle.value.trim().length > 0 &&
            selectedPIC.value != null
        );
        const subtitle = computed(() =>
            isConnected.value && connectedBookingNumber.value
                ? `Modifying Order #${connectedBookingNumber.value}`
                : 'Drafting New Order'
        );
        const itemCount = computed(() => cartItems.value.length);
        const confirmLabel = computed(() =>
            hasOverbooking.value && canConfirm.value
                ? 'Proceed (Overbooked)'
                : 'Confirm Booking'
        );
        const bookingDropdownDisplay = computed(() =>
            selectedBookingOption.value
                ? `${selectedBookingOption.value.BookingNumber} • ${selectedBookingOption.value.BookingTitle}`
                : 'Select Booking ID...'
        );
        const picDropdownDisplay = computed(() =>
            selectedPICName.value || 'Select Teammate...'
        );

        // ── Helper: build full cartData snapshot from the variable ──
        function buildCartVariable({ excludeSku, quantityOverrides } = {}) {
            let items = cartItems.value.map(i => ({
                SKU: i.SKU,
                Quantity: i.Quantity != null ? i.Quantity : 0,
                Status: i.Status || null,
            }));

            if (excludeSku) {
                items = items.filter(i => i.SKU !== excludeSku);
            }
            if (quantityOverrides) {
                for (const sku in quantityOverrides) {
                    const item = items.find(i => i.SKU === sku);
                    if (item) item.Quantity = quantityOverrides[sku];
                }
            }

            return {
                Booking_Header: {
                    id: cartHeader.value?.id || null,
                    BookingNumber: cartHeader.value?.BookingNumber || null,
                    created_at: cartHeader.value?.created_at || null,
                    BookingTitle: bookingTitle.value || null,
                    PIC_ID: selectedPIC.value || null,
                },
                Booking_Items: items,
            };
        }

        // ── Actions — all emit, no internal state changes ──

        function updateQuantity(index, val) {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */

            const qty = Math.max(0, parseInt(val) || 0);
            const item = cartItems.value[index];
            if (!item) return;

            emit('trigger-event', {
                name: 'quantityChange',
                event: { value: buildCartVariable({ quantityOverrides: { [item.SKU]: qty } }) },
            });
        }

        function removeItem(index) {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */

            const item = cartItems.value[index];
            if (!item) return;

            emit('trigger-event', {
                name: 'removeFromCart',
                event: { value: buildCartVariable({ excludeSku: item.SKU }) },
            });
        }

        function quickAdd() {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */

            const sku = quickAddInput.value.trim();
            if (!sku) return;

            if (refLookup.value[sku]) {
                emit('trigger-event', {
                    name: 'manualAdd',
                    event: { value: { SKU: sku, Quantity: 0, Status: null } },
                });
                quickAddInput.value = '';
                quickAddError.value = '';
            } else {
                quickAddError.value = 'No Match Found';
            }
        }

        function clearQuickAdd() {
            quickAddInput.value = '';
            quickAddError.value = '';
        }

        function connectBooking() {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */

            if (!selectedBookingOption.value) return;

            const header = selectedBookingOption.value;
            const items = bookingItemsData.value.filter(i => i.HeaderID === header.id);

            emit('trigger-event', {
                name: 'loadBooking',
                event: {
                    value: {
                        Booking_Header: {
                            id: header.id,
                            BookingNumber: header.BookingNumber,
                            created_at: header.created_at,
                            BookingTitle: header.BookingTitle,
                            PIC_ID: header.PIC_ID,
                        },
                        Booking_Items: items.map(i => ({
                            SKU: i.SKU,
                            Quantity: i.Quantity,
                            Status: i.Status,
                        })),
                    },
                },
            });
        }

        function disconnectBooking() {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */

            emit('trigger-event', {
                name: 'loadBooking',
                event: {
                    value: {
                        Booking_Header: { ...EMPTY_HEADER },
                        Booking_Items: cartItems.value.map(i => ({
                            SKU: i.SKU,
                            Quantity: 0,
                            Status: null,
                        })),
                    },
                },
            });
        }

        function confirmBooking() {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */

            if (!canConfirm.value) return;

            const now = new Date().toISOString();
            const snapshot = buildCartVariable();

            if (hasOverbooking.value) {
                emit('trigger-event', {
                    name: 'overbooking',
                    event: {
                        value: {
                            overbooked: true,
                            ...snapshot,
                        },
                    },
                });
            }

            emit('trigger-event', {
                name: 'booking',
                event: {
                    value: {
                        isEdit: isConnected.value,
                        Booking_Header: {
                            ...snapshot.Booking_Header,
                            created_at: isConnected.value ? (cartHeader.value?.created_at || null) : now,
                        },
                        Booking_Items: snapshot.Booking_Items,
                        updated_at: now,
                    },
                },
            });
        }

        // ── Dropdown helpers ──
        function toggleBookingDropdown() {
            if (isConnected.value) return;
            bookingDropdownOpen.value = !bookingDropdownOpen.value;
            picDropdownOpen.value = false;
        }
        function selectBooking(header) {
            selectedBookingOption.value = header;
            bookingDropdownOpen.value = false;
        }
        function togglePICDropdown() {
            picDropdownOpen.value = !picDropdownOpen.value;
            bookingDropdownOpen.value = false;
        }
        function selectPIC(teammate) {
            if (teammate) {
                selectedPIC.value = teammate.id;
                selectedPICName.value = teammate.Name;
            } else {
                selectedPIC.value = null;
                selectedPICName.value = '';
            }
            picDropdownOpen.value = false;
        }

        // ── Click-outside to close dropdowns ──
        function handleClickOutside(e) {
            if (bookingSelectEl.value && !bookingSelectEl.value.contains(e.target)) {
                bookingDropdownOpen.value = false;
            }
            if (picSelectEl.value && !picSelectEl.value.contains(e.target)) {
                picDropdownOpen.value = false;
            }
        }

        onMounted(() => document.addEventListener('mousedown', handleClickOutside));
        onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside));

        return {
            resolvedCart,
            resolvedBookingHeaders,
            resolvedTeammates,
            hasOverbooking,
            canConfirm,
            subtitle,
            itemCount,
            confirmLabel,
            bookingDropdownDisplay,
            picDropdownDisplay,
            isConnected,
            bookingTitle,
            selectedPIC,
            selectedBookingOption,
            bookingDropdownOpen,
            picDropdownOpen,
            quickAddInput,
            quickAddError,
            bookingSelectEl,
            picSelectEl,
            updateQuantity,
            removeItem,
            quickAdd,
            clearQuickAdd,
            connectBooking,
            disconnectBooking,
            confirmBooking,
            toggleBookingDropdown,
            selectBooking,
            togglePICDropdown,
            selectPIC,
        };
    },
};
</script>

<style lang="scss" scoped>
/* ── Tokens ── */
$blue: #3b82f6;
$blue-dark: #2563eb;
$red: #ef4444;
$red-dark: #dc2626;
$gray-900: #111827;
$gray-700: #374151;
$gray-500: #6b7280;
$gray-400: #9ca3af;
$gray-300: #d1d5db;
$gray-200: #e5e7eb;
$gray-100: #f3f4f6;
$gray-50: #f9fafb;
$white: #ffffff;
$radius: 10px;
$radius-sm: 6px;
$transition: 0.15s ease;

/* ── Root container ── */
.inventory-booking-cart {
    display: flex;
    flex-direction: row;
    gap: 0;
    width: 100%;
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: $gray-900;
    overflow: hidden;
}

/* ═══════════ LEFT PANEL ═══════════ */
.left-panel {
    flex: 7;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 24px 28px;
}

.cart-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;
}
.header-title {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    line-height: 1.3;
    color: $gray-900;
}
.header-subtitle {
    font-size: 13px;
    color: $gray-500;
    margin: 2px 0 0;
}
.header-count {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
    white-space: nowrap;
}
.count-divider {
    color: $gray-300;
    font-weight: 300;
    font-size: 18px;
}
.count-text {
    font-size: 13px;
    color: $gray-500;
    font-weight: 500;
}

/* ── Empty state ── */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 60px 20px;
    color: $gray-400;
}
.empty-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 14px;
    opacity: 0.5;
}
.empty-text {
    font-size: 13px;
    margin: 0;
}

/* ── Cart table ── */
.cart-table {
    flex: 1;
    display: flex;
    flex-direction: column;
}
.table-head {
    display: flex;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid $gray-200;
    margin-bottom: 4px;
}
.th {
    font-size: 11px;
    font-weight: 600;
    color: $gray-400;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}
.th-image   { width: 64px;  flex-shrink: 0; }
.th-details { flex: 1; }
.th-avail   { width: 120px; text-align: center; flex-shrink: 0; }
.th-qty     { width: 110px; text-align: center; flex-shrink: 0; }
.th-action  { width: 44px;  flex-shrink: 0; }

.table-body {
    display: flex;
    flex-direction: column;
}
.table-row {
    display: flex;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid $gray-100;
    &:last-child { border-bottom: none; }
}
.td { display: flex; align-items: center; }
.td-image   { width: 64px;  flex-shrink: 0; justify-content: center; }
.td-details { flex: 1; flex-direction: column; align-items: flex-start; min-width: 0; }
.td-avail   { width: 120px; flex-direction: column; align-items: center; flex-shrink: 0; }
.td-qty     { width: 110px; justify-content: center; flex-shrink: 0; }
.td-action  { width: 44px;  justify-content: center; flex-shrink: 0; }

.product-img {
    width: 44px;
    height: 44px;
    border-radius: $radius-sm;
    object-fit: cover;
}
.product-img-placeholder {
    width: 44px;
    height: 44px;
    border-radius: $radius-sm;
    background: $gray-100;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $gray-400;
    svg { width: 24px; height: 24px; }
}

.product-model {
    font-weight: 600;
    font-size: 14px;
    color: $gray-900;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}
.product-variant {
    font-size: 12px;
    color: $gray-500;
    margin-top: 1px;
}
.product-sku {
    font-size: 11px;
    color: $gray-400;
    margin-top: 1px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    letter-spacing: 0.02em;
}

.avail-number {
    font-size: 15px;
    font-weight: 600;
    color: $gray-700;
}
.td-avail.is-over .avail-number {
    color: $red;
}
.over-limit-badge {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    font-weight: 600;
    color: $red;
    margin-top: 2px;
    svg { flex-shrink: 0; }
}

.qty-input {
    width: 72px;
    height: 36px;
    border: 1.5px solid $gray-300;
    border-radius: $radius-sm;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: $gray-900;
    background: $white;
    outline: none;
    transition: border-color $transition;
    -moz-appearance: textfield;
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    &:focus { border-color: $blue; }
    &.is-over {
        border-color: $red;
        color: $red;
    }
}

.btn-remove {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    color: $gray-400;
    cursor: pointer;
    border-radius: $radius-sm;
    transition: color $transition, background $transition;
    svg { width: 18px; height: 18px; }
    &:hover { color: $red; background: rgba($red, 0.06); }
}

/* ═══════════ DIVIDER ═══════════ */
.panel-divider {
    width: 1px;
    background: $gray-200;
    flex-shrink: 0;
}

/* ═══════════ RIGHT PANEL ═══════════ */
.right-panel {
    flex: 3;
    min-width: 240px;
    display: flex;
    flex-direction: column;
    padding: 24px 22px;
    gap: 18px;
}

.rp-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.rp-label {
    font-size: 13px;
    font-weight: 600;
    color: $gray-700;
}
.rp-label--caps {
    font-size: 11px;
    font-weight: 700;
    color: $gray-400;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 5px;
}
.label-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
}

/* ── Custom select ── */
.custom-select {
    position: relative;
}
.select-trigger {
    display: flex;
    align-items: center;
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    background: $white;
    cursor: pointer;
    transition: border-color $transition;
    font-family: inherit;
    font-size: 13px;
    color: $gray-400;
    text-align: left;
    gap: 6px;
    &.has-value { color: $gray-900; }
    &:focus, &:hover { border-color: $blue; }
    &:disabled {
        background: $gray-50;
        cursor: default;
        &:hover { border-color: $gray-200; }
    }
}
.select-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.select-dots {
    color: $gray-400;
    font-weight: 700;
    letter-spacing: 2px;
    flex-shrink: 0;
    font-size: 12px;
}
.select-options {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: $white;
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    z-index: 50;
    list-style: none;
    margin: 0;
    padding: 4px 0;
    max-height: 200px;
    overflow-y: auto;
}
.select-option {
    padding: 8px 12px;
    font-size: 13px;
    color: $gray-700;
    cursor: pointer;
    transition: background $transition;
    &:hover { background: $gray-50; }
}
.select-option--placeholder {
    color: $gray-400;
    font-weight: 500;
    &:hover { background: rgba($blue, 0.04); }
}
.custom-select--icon .select-trigger {
    padding-left: 10px;
}
.custom-select--icon .field-icon {
    width: 18px;
    height: 18px;
    color: $gray-400;
    flex-shrink: 0;
}

/* ── Existing booking row ── */
.existing-booking-row {
    display: flex;
    gap: 8px;
    .custom-select { flex: 1; min-width: 0; }
}
.btn-connect {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    background: $white;
    color: $gray-400;
    cursor: pointer;
    transition: all $transition;
    svg { width: 18px; height: 18px; }
    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    &.btn-connect--ready {
        border-color: $blue;
        color: $blue;
        background: rgba($blue, 0.06);
        &:hover { background: $blue; color: $white; }
    }
    &.btn-connect--linked {
        border-color: $red;
        color: $red;
        background: rgba($red, 0.06);
        &:hover { background: $red; color: $white; }
    }
}

/* ── Quick Add ── */
.label-clear-btn {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    color: $gray-400;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    svg { width: 12px; height: 12px; }
    &:hover { color: $gray-700; }
}
.quick-add-row {
    display: flex;
    gap: 8px;
}
.quick-add-input {
    flex: 1;
    min-width: 0;
    height: 40px;
    padding: 0 12px;
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    font-size: 13px;
    color: $gray-900;
    background: $white;
    outline: none;
    font-family: inherit;
    transition: border-color $transition;
    &::placeholder { color: $gray-400; }
    &:focus { border-color: $blue; }
}
.btn-quick-add {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: $radius-sm;
    background: $blue;
    color: $white;
    cursor: pointer;
    transition: background $transition;
    svg { width: 18px; height: 18px; }
    &:hover { background: $blue-dark; }
}
.quick-add-error {
    font-size: 12px;
    color: $red;
    font-weight: 500;
    margin: 2px 0 0;
}

/* ── Input with icon ── */
.input-icon-wrap {
    display: flex;
    align-items: center;
    height: 40px;
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    padding: 0 12px;
    gap: 8px;
    background: $white;
    transition: border-color $transition;
    &:focus-within { border-color: $blue; }
    .field-icon {
        width: 18px;
        height: 18px;
        color: $gray-400;
        flex-shrink: 0;
    }
    .icon-input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 13px;
        color: $gray-900;
        font-family: inherit;
        background: transparent;
        &::placeholder { color: $gray-400; }
    }
}

/* ── Confirm button ── */
.btn-confirm {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 46px;
    border: none;
    border-radius: $radius-sm;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background $transition, opacity $transition;
    font-family: inherit;
    background: $blue;
    color: $white;
    &:hover { background: $blue-dark; }
    &.btn-confirm--overbooked {
        background: $red;
        &:hover { background: $red-dark; }
    }
    &.btn-confirm--disabled {
        background: $gray-200;
        color: $gray-400;
        cursor: not-allowed;
        &:hover { background: $gray-200; }
    }
}
.confirm-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}
.disclaimer {
    font-size: 11px;
    color: $gray-400;
    text-align: center;
    margin: 0;
    font-style: italic;
}
</style>

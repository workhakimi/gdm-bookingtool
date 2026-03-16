<template>
    <div class="inventory-booking-cart" :class="{ 'is-sending': isSending, 'is-releasing': isReleasing, 'is-success': isSuccessState }">
        <!-- Success overlay — darkens the tool, only confirm area is elevated above it -->
        <transition name="overlay-fade">
            <div v-if="isSuccessState" class="success-overlay"></div>
        </transition>

        <!-- ═══════════ LEFT PANEL ═══════════ -->
        <div class="left-panel">
            <!-- Existing Booking -->
            <div class="rp-section rp-section--existing-top">
                <label class="rp-label rp-label--caps">
                    <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="23 4 23 10 17 10" />
                        <polyline points="1 20 1 14 7 14" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    existing booking
                    <span class="connection-badge" :class="isConnected ? 'connection-badge--on' : ''">
                        ({{ isConnected ? 'Connected' : 'Not Connected' }})
                    </span>
                </label>
                <!-- Connected: booking chip + disconnect button -->
                <div v-if="isConnected" class="connected-booking-row">
                    <div class="connected-chip">
                        <span class="connected-bn">{{ connectedBookingNumber }}</span>
                        <span v-if="getBookingTitle(cartHeader)" class="connected-title">{{ getBookingTitle(cartHeader) }}</span>
                        <span v-if="getBookingPICName(cartHeader)" class="connected-pic">{{ getBookingPICName(cartHeader) }}</span>
                    </div>
                    <button
                        type="button"
                        class="btn-disconnect"
                        :disabled="isInputsDisabled"
                        title="Disconnect booking (keeps cart items)"
                        @click="disconnectBooking"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18.84 12.25l1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M5.16 11.75l-1.72 1.71a5 5 0 0 0 7.07 7.07l1.72-1.71" />
                            <line x1="2" y1="2" x2="22" y2="22" />
                        </svg>
                    </button>
                </div>

                <!-- Not connected: search input with dropdown (auto-connects on selection) -->
                <div v-else class="booking-search-wrap" ref="bookingSelectEl">
                    <input
                        type="text"
                        class="booking-search-input"
                        placeholder="Search existing booking..."
                        :value="bookingSearchQuery"
                        :disabled="isInputsDisabled"
                        @input="bookingSearchQuery = $event.target.value; bookingDropdownOpen = true; bookingHighlightedIndex = -1"
                        @focus="bookingDropdownOpen = true"
                        @blur="onBookingSearchBlur"
                        @keydown="onBookingSearchKeydown($event)"
                    />
                    <transition name="dropdown-fade">
                        <div v-if="bookingDropdownOpen" class="booking-dropdown" ref="bookingDropdownRef">
                            <div class="booking-dropdown-item booking-dropdown-item--placeholder" @mousedown.prevent="bookingDropdownOpen = false; bookingHighlightedIndex = -1">
                                Select Booking ID...
                            </div>
                            <div
                                v-for="(h, idx) in filteredBookingHeaders"
                                :key="h.id"
                                class="booking-dropdown-item"
                                :class="{ 'is-highlighted': idx === bookingHighlightedIndex }"
                                @mousedown.prevent="selectBooking(h)"
                            >
                                {{ formatBookingOption(h) }}
                            </div>
                            <div v-if="filteredBookingHeaders.length === 0 && bookingSearchQuery.trim()" class="booking-dropdown-item booking-dropdown-item--empty">
                                No matches
                            </div>
                        </div>
                    </transition>
                </div>
            </div>

            <div class="cart-header">
                <div class="header-info">
                    <h2 class="header-title">Booking Cart</h2>
                    <p class="header-subtitle">{{ subtitle }}</p>
                </div>
                <div class="header-count-row">
                    <span class="count-text">{{ itemCount }} Items</span>
                    <button
                        type="button"
                        class="btn-empty-cart"
                        :class="{ 'btn-empty-cart--confirm': emptyCartConfirm }"
                        :disabled="itemCount === 0 || isInputsDisabled"
                        @click="emptyCart"
                    >
                        {{ emptyCartConfirm ? 'Confirm empty?' : 'Empty Cart' }}
                    </button>
                </div>
            </div>

            <!-- Cart table -->
            <div class="cart-table">
                <div class="table-head">
                    <span class="th th-image">image</span>
                    <span class="th th-details">product details</span>
                    <span class="th th-avail">
                        Avl. Preview
                        <span class="th-info" title="This is a preview of what the sku availability would be with your input order quantity.">
                            <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                        </span>
                    </span>
                    <span class="th th-status">status</span>
                    <span class="th th-qty">order qty</span>
                    <span class="th th-action"></span>
                </div>
                <div class="table-body">
                    <div
                        v-for="(item, idx) in activeCartItems"
                        :key="item._originalIndex"
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
                            <img v-else src="https://mtbdsb.greydeal.cloud/storage/v1/object/sign/GeneralUse/No%20Image.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJHZW5lcmFsVXNlL05vIEltYWdlLnBuZyIsImlhdCI6MTc3MzYxNTc3OCwiZXhwIjoxODA1MTUxNzc4fQ.3KbcUK3TVIVZ3BG1cMY5X2pglRn3LBeEUQSax7gcK98" alt="No image" class="product-img" />
                        </div>

                        <!-- Product details -->
                        <div class="td td-details">
                            <div class="product-model">{{ item.model }}</div>
                            <div class="product-variant">{{ item.color }} · {{ item.size }}</div>
                            <div class="product-sku">{{ item.sku }}</div>
                        </div>

                        <!-- Avl. Preview -->
                        <div class="td td-avail" :class="{ 'is-over': item.isOverLimit, 'is-buffer': item.isUsingBuffer }">
                            <span class="avail-number">{{ item.avlPreview }}</span>
                            <span v-if="item.isOverLimit" class="over-limit-badge">
                                <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
                                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.5 3.5a.5.5 0 0 1 1 0v4a.5.5 0 0 1-1 0v-4zm.5 7.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z" />
                                </svg>
                                Over Limit
                            </span>
                            <span v-else-if="item.isUsingBuffer" class="buffer-badge">Using Buffer</span>
                        </div>

                        <!-- Status -->
                        <div class="td td-status">
                            <span class="status-badge" :style="statusBadgeStyle(item.statusDisplay)">{{ item.statusDisplay }}</span>
                        </div>

                        <!-- Order quantity -->
                        <div class="td td-qty">
                            <input
                                type="number"
                                class="qty-input"
                                :class="{ 'is-over': item.isOverLimit }"
                                :value="item.quantity"
                                min="0"
                                :disabled="isInputsDisabled"
                                @input="updateQuantity(item._originalIndex, $event.target.value)"
                            />
                        </div>

                        <!-- Remove -->
                        <div class="td td-action">
                            <button type="button" class="btn-remove" :disabled="isInputsDisabled" @click="removeItem(item._originalIndex)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Draft rows (inline SKU search) -->
                    <div v-for="row in draftRows" :key="row._uid" class="table-row table-row--draft">
                        <div class="td td-image">
                            <img src="https://mtbdsb.greydeal.cloud/storage/v1/object/sign/GeneralUse/No%20Image.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJHZW5lcmFsVXNlL05vIEltYWdlLnBuZyIsImlhdCI6MTc3MzYxNTc3OCwiZXhwIjoxODA1MTUxNzc4fQ.3KbcUK3TVIVZ3BG1cMY5X2pglRn3LBeEUQSax7gcK98" alt="No image" class="product-img" />
                        </div>
                        <div class="td td-details td-draft-search">
                            <div class="sku-search-wrap">
                                <input
                                    :ref="el => { if (el) draftInputRefs[row._uid] = el; }"
                                    type="text"
                                    class="sku-search-input"
                                    placeholder="Search SKU, model, or color..."
                                    :value="row._searchQuery"
                                    :disabled="isInputsDisabled"
                                    @input="row._searchQuery = $event.target.value; row._dropdownOpen = true; row._highlightedIndex = -1"
                                    @focus="row._dropdownOpen = true"
                                    @blur="onDraftSkuBlur(row._uid)"
                                    @keydown="onDraftSkuKeydown($event, row)"
                                />
                                <transition name="dropdown-fade">
                                    <div v-if="row._dropdownOpen && filteredInventory(row._searchQuery).length" class="sku-dropdown" :ref="el => { if (el) draftDropdownRefs[row._uid] = el; else delete draftDropdownRefs[row._uid]; }">
                                        <div
                                            v-for="(inv, idx) in filteredInventory(row._searchQuery)"
                                            :key="inv.sku"
                                            class="sku-dropdown-item"
                                            :class="{ 'is-highlighted': idx === row._highlightedIndex }"
                                            @mousedown.prevent="selectSkuForDraft(row._uid, inv)"
                                        >

                                            <img :src="inv.imagelink || inv.image_link || 'https://mtbdsb.greydeal.cloud/storage/v1/object/sign/GeneralUse/No%20Image.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJHZW5lcmFsVXNlL05vIEltYWdlLnBuZyIsImlhdCI6MTc3MzYxNTc3OCwiZXhwIjoxODA1MTUxNzc4fQ.3KbcUK3TVIVZ3BG1cMY5X2pglRn3LBeEUQSax7gcK98'" :alt="inv.sku" class="dd-item-img" />
                                            <div class="dd-item-info">
                                                <span class="dd-item-model">{{ inv.model }}</span>
                                                <span class="dd-item-variant">{{ inv.color }} · {{ inv.size }}</span>
                                            </div>
                                            <span class="dd-item-sku">{{ inv.sku }}</span>
                                        </div>
                                        <div v-if="filteredInventory(row._searchQuery).length === 30" class="sku-dropdown-hint">Showing first 30 — refine your search</div>
                                    </div>
                                </transition>
                            </div>
                        </div>
                        <div class="td td-avail"></div>
                        <div class="td td-status"></div>
                        <div class="td td-qty"></div>
                        <div class="td td-action">
                            <button type="button" class="btn-remove" @click="removeDraftRow(row._uid)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Item button -->
            <button
                type="button"
                class="btn-add-item"
                :disabled="isInputsDisabled"
                @click="addDraftRow"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Item
            </button>
            <p class="add-item-hint">Click Add Item below or in previewer to add to cart.</p>

            <!-- Released items collapsible -->
            <div v-if="releasedCartItems.length" class="released-section">
                <button type="button" class="released-toggle" @click="releasedOpen = !releasedOpen">
                    <svg class="released-chevron" :class="{ 'is-open': releasedOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Released ({{ releasedCartItems.length }})
                </button>
                <div class="released-body" :class="{ 'is-open': releasedOpen }">
                    <div class="released-inner">
                        <div
                            v-for="item in releasedCartItems"
                            :key="item._originalIndex"
                            class="table-row table-row--released"
                        >
                            <div class="td td-image">
                                <img :src="item.imageLink" :alt="item.model" class="product-img" />
                            </div>
                            <div class="td td-details">
                                <div class="product-model">{{ item.model }}</div>
                                <div class="product-variant">{{ item.color }} · {{ item.size }}</div>
                                <div class="product-sku">{{ item.sku }}</div>
                            </div>
                            <div class="td td-avail">
                                <span class="avail-number">{{ item.avlPreview }}</span>
                            </div>
                            <div class="td td-status">
                                <span class="status-badge" :style="statusBadgeStyle(item.statusDisplay)">{{ item.statusDisplay }}</span>
                            </div>
                            <div class="td td-qty">
                                <span class="released-qty">{{ item.quantity }}</span>
                            </div>
                            <div class="td td-action"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Change Log collapsible -->
            <div v-if="isConnected && currentChangeLogs.length" class="changelog-section">
                <button type="button" class="released-toggle" @click="changeLogOpen = !changeLogOpen">
                    <svg class="released-chevron" :class="{ 'is-open': changeLogOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Change Log ({{ currentChangeLogs.length }})
                </button>
                <div class="released-body" :class="{ 'is-open': changeLogOpen }">
                    <div class="released-inner changelog-scroll">
                        <div v-for="log in currentChangeLogs" :key="log.id" class="cl-entry">
                            <div class="cl-row">
                                <span class="cl-category">{{ log.category }}</span>
                                <span class="cl-action">{{ log.action }}</span>
                                <span class="cl-time">{{ formatLogDate(log.timestamp) }}</span>
                            </div>
                            <div class="cl-desc">{{ log.description }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══════════ DIVIDER ═══════════ -->
        <div class="panel-divider"></div>

        <!-- ═══════════ RIGHT PANEL ═══════════ -->
        <div class="right-panel">
            <!-- Booking Title -->
            <div class="rp-section">
                <label class="rp-label">Booking Title<span v-if="bookingTitleWillUpdate" class="label-updating"> (Updating)</span></label>
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
                        :disabled="isInputsDisabled"
                    />
                </div>
            </div>

            <!-- Person In Charge -->
            <div class="rp-section">
                <label class="rp-label">Person In Charge<span v-if="picWillUpdate" class="label-updating"> (Updating)</span></label>
                <div class="custom-select custom-select--icon" ref="picSelectEl">
                    <button
                        type="button"
                        class="select-trigger"
                        :class="{ 'has-value': !!selectedPIC }"
                        :disabled="isInputsDisabled"
                        @click="togglePICDropdown"
                    >
                        <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span class="select-text">{{ picDropdownDisplay }}</span>
                    </button>
                    <ul v-if="picDropdownOpen" class="select-options select-options--with-search">
                        <li class="select-option select-search-wrap" @mousedown.prevent>
                            <input
                                ref="picSearchInput"
                                v-model="picSearchQuery"
                                type="text"
                                class="select-search-input"
                                placeholder="Search teammate..."
                                @keydown.stop
                            />
                        </li>
                        <li class="select-option select-option--placeholder" @mousedown.prevent="selectPIC(null)">
                            Select Teammate...
                        </li>
                        <li
                            v-for="t in filteredTeammates"
                            :key="t.id"
                            class="select-option"
                            @mousedown.prevent="selectPIC(t)"
                        >
                            {{ t.name }}
                        </li>
                        <li v-if="filteredTeammates.length === 0 && picSearchQuery.trim()" class="select-option select-option--empty">
                            No matches
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Confirm area — elevated above overlay in success state -->
            <div class="confirm-area" :class="{ 'confirm-area--elevated': isSuccessState }">
                <button
                    class="btn-confirm"
                    :class="{
                        'btn-confirm--overbooked': hasOverbooking && canConfirm && !stagingStatus,
                        'btn-confirm--disabled': !canConfirm && !stagingStatus && !isConnectedWithEmptyCart && !isSuccessState && !isFailed,
                        'btn-confirm--release': isConnectedWithEmptyCart && !isSuccessState && !isFailed,
                        'btn-confirm--sending': (stagingStatus === 'Sending' || stagingStatus === 'Releasing') && !isTimedOut,
                        'btn-confirm--failed': stagingStatus === 'Failed' || isTimedOut,
                        'btn-confirm--success': stagingStatus === 'Successful',
                        'btn-confirm--success-released': stagingStatus === 'Successful_Released',
                    }"
                    :disabled="((stagingStatus === 'Sending' || stagingStatus === 'Releasing') && !isTimedOut) || (stagingStatus !== 'Successful' && stagingStatus !== 'Successful_Released' && stagingStatus !== 'Failed' && !isTimedOut && !canConfirm && !isConnectedWithEmptyCart)"
                    @click="onConfirmClick"
                    type="button"
                >
                    <!-- Overbooked warning icon -->
                    <svg v-if="hasOverbooking && canConfirm && !stagingStatus" class="confirm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <!-- Timed out / Failed: alert -->
                    <svg v-else-if="isTimedOut || stagingStatus === 'Failed'" class="confirm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <!-- Sending / Releasing: clock -->
                    <svg v-else-if="stagingStatus === 'Sending' || stagingStatus === 'Releasing'" class="confirm-icon confirm-icon--spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <!-- Success: check -->
                    <svg v-else-if="isSuccessState" class="confirm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <!-- Normal clock/confirm icon -->
                    <svg v-else class="confirm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {{ confirmLabel }}
                </button>
                <p v-if="stagingStatus === 'Failed' || isTimedOut" class="booking-failed-hint">
                    {{ isTimedOut ? 'Request timed out.' : 'Something went wrong.' }} <button type="button" class="btn-failed-dismiss" @click="onDismissFailure">Dismiss</button>
                </p>
                <p v-if="stagingStatus === 'Successful'" class="booking-success-line">
                    Booked as <span class="booking-success-var">{{ getBookingNumber(cartHeader) }}</span> &mdash; <span class="booking-success-var">{{ getBookingTitle(cartHeader) }}</span> by <span class="booking-success-var">{{ successTeammateName }}</span> at <span class="booking-success-var">{{ formattedBookingTime }}</span>
                </p>
                <p v-if="stagingStatus === 'Successful_Released'" class="booking-success-line">
                    Released <span class="booking-success-var">{{ releasedBn }}</span>
                </p>
                <p v-if="isSuccessState" class="success-dismiss-hint">Click the button to continue</p>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';

const EMPTY_HEADER = { id: null, bookingnumber: null, created_at: null, bookingtitle: null, pic_id: null };
const BUFFER_WARNING_THRESHOLD = 25; // avlPreview in [0, THRESHOLD) triggers "Using Buffer"

function getBookingNumber(header) {
    return header?.bookingnumber ?? null;
}
function getBookingTitle(header) {
    return header?.bookingtitle ?? null;
}

function formatShortDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const mins = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${day} ${month} ${year} ${hours}:${mins}${ampm}`;
}

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
            (wwLib.wwUtils.getDataFromCollection(props.content?.referenceData) || [])
                .filter(item => item.sku && !String(item.sku).includes('#N/A'))
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

        // ── PIC name lookup (needs resolvedTeammates) ──
        function getBookingPICName(header) {
            if (!header?.pic_id) return '';
            const tm = resolvedTeammates.value.find(t => t.id === header.pic_id);
            return tm ? tm.name : '';
        }

        function formatBookingOption(header) {
            const parts = [
                getBookingNumber(header),
                getBookingTitle(header),
                getBookingPICName(header),
                formatShortDate(header?.created_at),
            ].filter(Boolean);
            return parts.join(' - ');
        }

        // ── Booking search ──
        const bookingSearchQuery = ref('');
        const filteredBookingHeaders = computed(() => {
            const list = resolvedBookingHeaders.value;
            const q = bookingSearchQuery.value.trim().toLowerCase();
            if (!q) return list;
            return list.filter(h => {
                const num = (getBookingNumber(h) || '').toLowerCase();
                const title = (getBookingTitle(h) || '').toLowerCase();
                const picName = getBookingPICName(h).toLowerCase();
                return num.includes(q) || title.includes(q) || picName.includes(q);
            });
        });

        // ── PIC search ──
        const picSearchQuery = ref('');
        const picSearchInput = ref(null);
        const filteredTeammates = computed(() => {
            const list = resolvedTeammates.value;
            const q = picSearchQuery.value.trim().toLowerCase();
            if (!q) return list;
            return list.filter(t => (t.name || '').toLowerCase().includes(q));
        });

        // ── Resolve cartData as a structured object ──
        function normalizeHeader(h) {
            if (!h || typeof h !== 'object') return { ...EMPTY_HEADER };
            return {
                id: h.id ?? null,
                bookingnumber: getBookingNumber(h),
                created_at: h.created_at ?? null,
                bookingtitle: getBookingTitle(h),
                pic_id: h.pic_id ?? null,
                updated_at: h.updated_at ?? null,
            };
        }
        function normalizeItem(it) {
            if (!it || typeof it !== 'object') return { id: null, headerid: null, sku: null, quantity: 0, status: null };
            return {
                id: it.id ?? null,
                headerid: it.headerid ?? it.header_id ?? null,
                sku: it.sku ?? null,
                quantity: it.quantity ?? 0,
                status: it.status ?? null,
            };
        }
        const cartDataObj = computed(() => {
            const raw = props.content?.cartData;
            if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
                return { booking_header: { ...EMPTY_HEADER }, booking_items: [] };
            }
            const resolved = wwLib.wwUtils.getDataFromCollection(raw);
            const src = (resolved && typeof resolved === 'object' && !Array.isArray(resolved)) ? resolved : raw;
            let h = src.booking_header;
            let items = src.booking_items;
            if (!h && !items && (src.id != null || src.bookingnumber != null)) {
                h = src;
                items = [];
            }
            if (!h && !items) return { booking_header: { ...EMPTY_HEADER }, booking_items: [], staging_status: src.staging_status ?? null, updated_at: src.updated_at, released_bn: src.released_bn ?? null };
            return {
                booking_header: normalizeHeader(h) || { ...EMPTY_HEADER },
                booking_items: Array.isArray(items) ? items.map(normalizeItem) : [],
                staging_status: src.staging_status ?? null,
                updated_at: src.updated_at,
                released_bn: src.released_bn ?? null,
            };
        });
        const cartHeader = computed(() => cartDataObj.value?.booking_header || {});
        const cartItems = computed(() => cartDataObj.value?.booking_items || []);
        const stagingStatus = computed(() => cartDataObj.value?.staging_status ?? null);
        const releasedBn = computed(() => cartDataObj.value?.released_bn ?? null);
        const isSending = computed(() => stagingStatus.value === 'Sending');
        const isReleasing = computed(() => stagingStatus.value === 'Releasing');
        const isFailed = computed(() => stagingStatus.value === 'Failed');
        const isSuccessState = computed(() => stagingStatus.value === 'Successful' || stagingStatus.value === 'Successful_Released');
        const isInputsDisabled = computed(() => isSending.value || isReleasing.value || isSuccessState.value);

        // ── UI-only state (form fields + dropdowns) ──
        const bookingTitle = ref('');
        const selectedPIC = ref(null);
        const selectedPICName = ref('');
        const lastSyncedHeaderId = ref(undefined);

        const selectedBookingOption = ref(null);
        const bookingDropdownOpen = ref(false);
        const picDropdownOpen = ref(false);

        const lastAttemptedAction = ref(null); // 'booking' | 'releaseBooking' — used for retry when Failed
        const originalBookingQtys = ref({}); // sku -> qty when booking was loaded (for Avl. Preview)
        const originalBookingItems = ref([]); // full snapshot [{sku, quantity, status}] when booking was loaded
        const emptyCartConfirm = ref(false); // two-click confirm for empty cart
        let _qtyDebounceTimer = null; // debounce handle for quantity changes

        // ── Draft rows for inline SKU search ──
        const draftRows = ref([]);
        const draftInputRefs = {};
        const draftDropdownRefs = {}; // keyed by _uid → dropdown container el

        // ── Booking dropdown keyboard nav ──
        const bookingHighlightedIndex = ref(-1);
        const bookingDropdownRef = ref(null);

        const bookingSelectEl = ref(null);
        const picSelectEl = ref(null);

        // ── Derived state from variable ──
        const isConnected = computed(() => !!cartHeader.value?.id);
        const connectedBookingNumber = computed(() => getBookingNumber(cartHeader.value) || null);

        // ── Sync title / PIC from header when header ID changes ──
        watch(cartHeader, (header) => {
            const currentId = header?.id || null;
            if (currentId === lastSyncedHeaderId.value) return;

            if (currentId) {
                const qtyMap = {};
                cartItems.value.forEach(i => {
                    if ((i.status || '') !== 'Released') {
                        qtyMap[i.sku] = (qtyMap[i.sku] || 0) + (i.quantity ?? 0);
                    }
                });
                originalBookingQtys.value = qtyMap;
                originalBookingItems.value = cartItems.value.map(i => ({
                    id: i.id ?? null,
                    headerid: i.headerid ?? null,
                    sku: i.sku,
                    quantity: i.quantity ?? 0,
                    status: i.status ?? null,
                }));
            } else {
                originalBookingQtys.value = {};
                originalBookingItems.value = [];
            }

            bookingTitle.value = getBookingTitle(header) || '';
            if (header?.pic_id) {
                selectedPIC.value = header.pic_id;
                const tm = resolvedTeammates.value.find(t => t.id === header.pic_id);
                selectedPICName.value = tm ? tm.name : '';
            } else {
                selectedPIC.value = null;
                selectedPICName.value = '';
            }
            selectedBookingOption.value = (currentId && getBookingNumber(header)) ? { ...header } : null;
            lastSyncedHeaderId.value = currentId;
        }, { immediate: true, deep: true });

        const isTimedOut = ref(false);
        let _sendingTimeout = null;

        watch(stagingStatus, (s) => {
            if (s === 'Successful' || s === 'Successful_Released') lastAttemptedAction.value = null;
            // Clear any existing timeout
            clearTimeout(_sendingTimeout);
            isTimedOut.value = false;
            // Start 7s timeout when Sending or Releasing
            if (s === 'Sending' || s === 'Releasing') {
                _sendingTimeout = setTimeout(() => {
                    // Only timeout if still in Sending/Releasing state
                    if (stagingStatus.value === 'Sending' || stagingStatus.value === 'Releasing') {
                        isTimedOut.value = true;
                    }
                }, 7000);
            }
        });

        // ── Reference data lookup ──
        const refLookup = computed(() => {
            const map = {};
            referenceData.value.forEach(r => { map[r.sku] = r; });
            return map;
        });

        // ── Standard status badge colors ──
        const STATUS_COLORS = {
            'Booked': { bg: '#dbeafe', color: '#1e40af' },
            'Carted': { bg: '#dbeafe', color: '#1e40af' },
            'Issue Raised': { bg: '#fee2e2', color: '#991b1b' },
            'Processing': { bg: '#fef9c3', color: '#854d0e' },
            'Delivered to Production': { bg: '#f3e8ff', color: '#6b21a8' },
            'Delivered to Client': { bg: '#dcfce7', color: '#166534' },
            'Released': { bg: '#f3f4f6', color: '#6b7280' },
        };

        function statusBadgeStyle(status) {
            const s = STATUS_COLORS[status];
            if (s) return { background: s.bg, color: s.color };
            return {};
        }

        // ── Resolved cart — balance for over-limit check; Avl. Preview = availability + original booking qty + order qty ──
        const resolvedCart = computed(() => {
            const originals = originalBookingQtys.value;
            // Sum active (non-Released) qty per SKU for balance calculation
            const activeQtyBySku = {};
            cartItems.value.forEach(i => {
                if ((i.status || '') !== 'Released') {
                    activeQtyBySku[i.sku] = (activeQtyBySku[i.sku] || 0) + (i.quantity ?? 0);
                }
            });
            return cartItems.value.map((i, idx) => {
                const skuKey = i.sku;
                const ref = refLookup.value[skuKey];
                const balance = ref ? (Number(ref.balance) || 0) : 0;
                const qty = i.quantity != null ? i.quantity : 0;
                const originalQty = originals[skuKey] ?? 0;
                const isReleased = (i.status || '') === 'Released';
                // Released items don't consume balance; for active items, use total active qty for that SKU
                const totalActiveQty = activeQtyBySku[skuKey] || 0;
                const avlPreview = isReleased ? balance : (balance + originalQty - totalActiveQty);
                const isUsingBuffer = !isReleased && avlPreview >= 0 && avlPreview < BUFFER_WARNING_THRESHOLD;
                const isOverLimit = !isReleased && avlPreview < 0;
                return {
                    _originalIndex: idx,
                    sku: skuKey,
                    quantity: qty,
                    statusDisplay: i.status && String(i.status).trim() ? i.status : 'Carted',
                    model: ref ? ref.model : 'Unknown Item',
                    color: ref ? ref.color : '-',
                    size: ref ? ref.size : '-',
                    imageLink: (ref ? (ref.imagelink ?? ref.image_link) : null) || 'https://mtbdsb.greydeal.cloud/storage/v1/object/sign/GeneralUse/No%20Image.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJHZW5lcmFsVXNlL05vIEltYWdlLnBuZyIsImlhdCI6MTc3MzYxNTc3OCwiZXhwIjoxODA1MTUxNzc4fQ.3KbcUK3TVIVZ3BG1cMY5X2pglRn3LBeEUQSax7gcK98',
                    available: balance,
                    avlPreview,
                    isOverLimit,
                    isUsingBuffer,
                    isUnknown: !ref,
                };
            });
        });

        // ── Active / Released split ──
        const activeCartItems = computed(() => resolvedCart.value.filter(i => i.statusDisplay !== 'Released'));
        const releasedCartItems = computed(() => resolvedCart.value.filter(i => i.statusDisplay === 'Released'));
        const releasedOpen = ref(false);
        const changeLogOpen = ref(false);

        // ── Change Log data ──
        const changeLogData = computed(() =>
            wwLib.wwUtils.getDataFromCollection(props.content?.changeLogData) || []
        );
        const currentChangeLogs = computed(() => {
            const hdrId = cartHeader.value?.id;
            if (!hdrId) return [];
            return changeLogData.value
                .filter(log => log.connection === hdrId)
                .slice()
                .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        });

        function formatLogDate(ts) {
            if (!ts) return '';
            try {
                const d = new Date(ts);
                return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
            } catch (e) { return ts; }
        }

        // ── Computed helpers ──
        const hasOverbooking = computed(() => activeCartItems.value.some(i => i.isOverLimit));
        const canConfirm = computed(() =>
            cartItems.value.length > 0 &&
            bookingTitle.value.trim().length > 0 &&
            selectedPIC.value != null &&
            activeCartItems.value.every(i => i.quantity > 0) &&
            !hasOverbooking.value
        );
        const isConnectedWithEmptyCart = computed(() =>
            isConnected.value && cartItems.value.length === 0
        );
        const subtitle = computed(() =>
            isConnected.value && connectedBookingNumber.value
                ? `Modifying Order #${connectedBookingNumber.value}`
                : 'Drafting New Order'
        );
        const itemCount = computed(() => activeCartItems.value.length);
        const confirmLabel = computed(() => {
            if (isTimedOut.value) return 'Timed out, Click to retry';
            if (stagingStatus.value === 'Sending') return 'Submitting Booking...';
            if (stagingStatus.value === 'Releasing') return 'Releasing Booking...';
            if (stagingStatus.value === 'Failed') return 'There was a problem, Click to retry';
            if (stagingStatus.value === 'Successful') return 'Successfully Booked';
            if (stagingStatus.value === 'Successful_Released') return 'Successfully Released';
            if (isConnectedWithEmptyCart.value) return 'Release Booking';
            return 'Confirm Booking';
        });
        const successTeammateName = computed(() => {
            if (stagingStatus.value !== 'Successful') return '';
            const pid = cartHeader.value?.pic_id;
            if (pid == null) return '';
            const t = resolvedTeammates.value.find(t => t.id === pid);
            return t ? t.name : '';
        });
        const formattedBookingTime = computed(() => {
            if (stagingStatus.value !== 'Successful') return '';
            const raw = cartHeader.value?.updated_at ?? cartDataObj.value?.updated_at;
            if (!raw) return '';
            const d = new Date(raw);
            if (Number.isNaN(d.getTime())) return '';
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const day = d.getDate();
            const month = months[d.getMonth()];
            const year = d.getFullYear();
            const time = d.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' }).replace(/\s*([ap]m)/i, (_, m) => m.toLowerCase());
            return `${day} ${month} ${year}, ${time}`;
        });
        const picDropdownDisplay = computed(() =>
            selectedPICName.value || 'Select Teammate...'
        );
        const bookingTitleWillUpdate = computed(() => {
            if (!isConnected.value) return false;
            const fromHeader = (getBookingTitle(cartHeader.value) || '').trim();
            const current = bookingTitle.value.trim();
            return current !== fromHeader;
        });
        const picWillUpdate = computed(() => {
            if (!isConnected.value) return false;
            const fromHeader = cartHeader.value?.pic_id ?? null;
            const current = selectedPIC.value ?? null;
            return current !== fromHeader;
        });

        // ── Helper: build full cartData snapshot from the variable ──
        function buildCartVariable({ excludeIndex, quantityOverrides } = {}) {
            let items = cartItems.value.map((i, idx) => ({
                _idx: idx,
                id: i.id ?? null,
                headerid: i.headerid ?? null,
                sku: i.sku,
                quantity: i.quantity != null ? i.quantity : 0,
                status: i.status ?? null,
            }));

            if (excludeIndex != null) {
                items = items.filter(i => i._idx !== excludeIndex);
            }
            if (quantityOverrides) {
                for (const idx in quantityOverrides) {
                    const item = items.find(i => i._idx === Number(idx));
                    if (item) item.quantity = quantityOverrides[idx];
                }
            }
            items.forEach(i => { delete i._idx; });

            return {
                booking_header: {
                    id: cartHeader.value?.id || null,
                    bookingnumber: getBookingNumber(cartHeader.value) || null,
                    created_at: cartHeader.value?.created_at || null,
                    bookingtitle: bookingTitle.value || getBookingTitle(cartHeader.value) || null,
                    pic_id: (selectedPIC.value ?? cartHeader.value?.pic_id) || null,
                },
                booking_items: items,
            };
        }

        // ── Actions — all emit, no internal state changes ──

        function updateQuantity(index, val) {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            if (isInputsDisabled.value) return;

            const qty = Math.max(0, parseInt(val) || 0);
            const item = cartItems.value[index];
            if (!item) return;

            clearTimeout(_qtyDebounceTimer);
            _qtyDebounceTimer = setTimeout(() => {
                emit('trigger-event', {
                    name: 'quantityChange',
                    event: { value: buildCartVariable({ quantityOverrides: { [index]: qty } }) },
                });
            }, 300);
        }

        function removeItem(index) {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            if (isInputsDisabled.value) return;

            const item = cartItems.value[index];
            if (!item) return;

            emit('trigger-event', {
                name: 'removeFromCart',
                event: { value: buildCartVariable({ excludeIndex: index }) },
            });
        }

        // ── Inventory search for draft rows ──
        function filteredInventory(query) {
            let all = referenceData.value;
            // Filter out DISC / Pending tagged items when enabled
            if (props.content?.filterDiscPending) {
                all = all.filter(item => {
                    const tags = String(item.tags || '').toLowerCase();
                    return !tags.includes('disc') && !tags.includes('pending');
                });
            }
            if (!query || !query.trim()) return all.slice(0, 30);
            const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
            return all.filter(item => {
                const hay = `${item.sku || ''} ${item.model || ''} ${item.color || ''} ${item.size || ''}`.toLowerCase();
                return tokens.every(tok => hay.includes(tok));
            }).slice(0, 30);
        }

        function addDraftRow() {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            if (isInputsDisabled.value) return;
            const uid = 'draft-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
            draftRows.value.push({ _uid: uid, _searchQuery: '', _dropdownOpen: false, _highlightedIndex: -1 });
            nextTick(() => {
                const input = draftInputRefs[uid];
                if (input) input.focus();
            });
        }

        function removeDraftRow(uid) {
            draftRows.value = draftRows.value.filter(r => r._uid !== uid);
            delete draftInputRefs[uid];
        }

        function selectSkuForDraft(uid, item) {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            if (isInputsDisabled.value) return;
            emit('trigger-event', {
                name: 'manualAdd',
                event: { value: { sku: item.sku, quantity: 0, status: null } },
            });
            removeDraftRow(uid);
        }

        function onDraftSkuBlur(uid) {
            setTimeout(() => {
                const row = draftRows.value.find(r => r._uid === uid);
                if (row) { row._dropdownOpen = false; row._highlightedIndex = -1; }
            }, 150);
        }

        function onDraftSkuKeydown(event, row) {
            const items = filteredInventory(row._searchQuery);
            if (!row._dropdownOpen || !items.length) {
                if (event.key === 'Escape') { row._dropdownOpen = false; row._highlightedIndex = -1; }
                return;
            }
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                row._highlightedIndex = (row._highlightedIndex + 1) % items.length;
                scrollDropdownItemIntoView(draftDropdownRefs[row._uid], row._highlightedIndex);
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                row._highlightedIndex = (row._highlightedIndex - 1 + items.length) % items.length;
                scrollDropdownItemIntoView(draftDropdownRefs[row._uid], row._highlightedIndex);
            } else if (event.key === 'Enter') {
                event.preventDefault();
                if (row._highlightedIndex >= 0 && row._highlightedIndex < items.length) {
                    selectSkuForDraft(row._uid, items[row._highlightedIndex]);
                }
            } else if (event.key === 'Escape') {
                event.preventDefault();
                row._dropdownOpen = false;
                row._highlightedIndex = -1;
            }
        }

        function onBookingSearchKeydown(event) {
            const items = filteredBookingHeaders.value;
            if (!bookingDropdownOpen.value) return;
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                bookingHighlightedIndex.value = (bookingHighlightedIndex.value + 1) % items.length;
                scrollDropdownItemIntoView(bookingDropdownRef.value, bookingHighlightedIndex.value);
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                bookingHighlightedIndex.value = (bookingHighlightedIndex.value - 1 + items.length) % items.length;
                scrollDropdownItemIntoView(bookingDropdownRef.value, bookingHighlightedIndex.value);
            } else if (event.key === 'Enter') {
                event.preventDefault();
                const idx = bookingHighlightedIndex.value;
                if (idx >= 0 && idx < items.length) {
                    selectBooking(items[idx]);
                    bookingHighlightedIndex.value = -1;
                }
            } else if (event.key === 'Escape') {
                event.preventDefault();
                bookingDropdownOpen.value = false;
                bookingHighlightedIndex.value = -1;
            }
        }

        function scrollDropdownItemIntoView(container, idx) {
            if (!container) return;
            const items = container.querySelectorAll('.sku-dropdown-item, .booking-dropdown-item:not(.booking-dropdown-item--placeholder):not(.booking-dropdown-item--empty)');
            if (items[idx]) items[idx].scrollIntoView({ block: 'nearest' });
        }

        function disconnectBooking() {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */

            emit('trigger-event', {
                name: 'unloadBooking',
                event: {
                    value: {
                        booking_items: [],
                        booking_header: { id: null, pic_id: null, created_at: null, bookingtitle: null, bookingnumber: null },
                    },
                },
            });
        }

        function emptyCart() {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            if (!emptyCartConfirm.value) {
                emptyCartConfirm.value = true;
                setTimeout(() => { emptyCartConfirm.value = false; }, 3000);
                return;
            }
            emptyCartConfirm.value = false;

            const h = cartHeader.value || {};
            emit('trigger-event', {
                name: 'clearCart',
                event: {
                    value: {
                        booking_header: {
                            id: h.id || null,
                            bookingnumber: getBookingNumber(h) || null,
                            created_at: h.created_at || null,
                            bookingtitle: bookingTitle.value || getBookingTitle(h) || null,
                            pic_id: (selectedPIC.value ?? h.pic_id) || null,
                        },
                        booking_items: [],
                    },
                },
            });
        }

        function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = (Math.random() * 16) | 0;
                return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
            });
        }

        function klTimestamp() {
            return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kuala_Lumpur' }).replace(' ', 'T') + '+08:00';
        }

        function generateBookingNumber() {
            const t = Date.now();
            const digits = (t % 1e6).toString().padStart(6, '0');
            return `BN-${digits}`;
        }

        function emitReleaseBooking() {
            const now = new Date().toISOString();
            const h = cartHeader.value || {};
            const header = {
                id: h.id ?? null,
                bookingnumber: getBookingNumber(h) ?? null,
                created_at: h.created_at ?? null,
                bookingtitle: getBookingTitle(h) ?? null,
                pic_id: h.pic_id ?? null,
            };

            // All original items become Released
            const allItems = originalBookingItems.value.map(i => ({
                id: i.id ?? generateUUID(),
                headerid: i.headerid ?? header.id,
                sku: i.sku,
                quantity: i.quantity ?? 0,
                status: 'Released',
            }));

            const bn = getBookingNumber(h) || '-';
            const skuList = allItems.map(i => i.sku).join(', ');
            const changeLog = {
                id: generateUUID(),
                timestamp: klTimestamp(),
                category: 'Booking',
                action: 'Booking Released by User with Inventory Booking Cart',
                description: `Booking ${bn} fully released with ${allItems.length} line item(s) (${skuList || 'none'}) via Inventory Booking Cart.`,
                connection: header.id,
            };

            lastAttemptedAction.value = 'releaseBooking';
            emit('trigger-event', {
                name: 'releaseBooking',
                event: {
                    value: {
                        staging_status: 'Releasing',
                        is_edit: true,
                        booking_header: header,
                        booking_items: allItems,
                        updated_at: now,
                        change_log: changeLog,
                    },
                },
            });
        }

        function onDismissFailure() {
            lastAttemptedAction.value = null;
            emit('trigger-event', {
                name: 'failedDismiss',
                event: { value: buildCartVariable() },
            });
        }

        function onConfirmClick() {
            // Retry on timeout or failure
            if (isTimedOut.value || stagingStatus.value === 'Failed') {
                isTimedOut.value = false;
                if (lastAttemptedAction.value === 'booking') {
                    confirmBooking();
                } else if (lastAttemptedAction.value === 'releaseBooking') {
                    emitReleaseBooking();
                }
                return;
            }
            if (stagingStatus.value === 'Successful') {
                draftRows.value = [];
                // Refresh original snapshots so next edit has correct baseline
                const qtyMap = {};
                cartItems.value.forEach(i => {
                    if ((i.status || '') !== 'Released') {
                        qtyMap[i.sku] = (qtyMap[i.sku] || 0) + (i.quantity ?? 0);
                    }
                });
                originalBookingQtys.value = qtyMap;
                originalBookingItems.value = cartItems.value.map(i => ({
                    id: i.id ?? null,
                    headerid: i.headerid ?? null,
                    sku: i.sku,
                    quantity: i.quantity ?? 0,
                    status: i.status ?? null,
                }));
                const payload = buildCartVariable();
                emit('trigger-event', {
                    name: 'successDismiss',
                    event: {
                        value: {
                            ...payload,
                            staging_status: null,
                        },
                    },
                });
                return;
            }
            if (stagingStatus.value === 'Successful_Released') {
                draftRows.value = [];
                emit('trigger-event', {
                    name: 'resetCart',
                    event: {
                        value: {
                            booking_items: [],
                            booking_header: { id: null, pic_id: null, created_at: null, bookingtitle: null, bookingnumber: null },
                        },
                    },
                });
                return;
            }
            if (isConnectedWithEmptyCart.value) {
                emitReleaseBooking();
                return;
            }
            confirmBooking();
        }

        function confirmBooking() {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */

            if (!canConfirm.value) return;

            const now = new Date().toISOString();
            const snapshot = buildCartVariable();
            const editing = isConnected.value;

            // Build header first so items can reference header.id
            const snapHeader = snapshot.booking_header ?? {};
            const header = {
                id: snapHeader.id ?? null,
                bookingnumber: getBookingNumber(snapHeader) ?? null,
                created_at: editing ? (cartHeader.value?.created_at || null) : now,
                bookingtitle: getBookingTitle(snapHeader) ?? bookingTitle.value ?? null,
                pic_id: snapHeader.pic_id ?? selectedPIC.value ?? null,
            };
            if (!editing) {
                header.id = generateUUID();
                header.bookingnumber = generateBookingNumber();
            }

            const itemsSnapshot = snapshot.booking_items ?? [];
            // Active items get status 'Booked', released items keep 'Released'
            const allItems = itemsSnapshot.map(i => ({
                id: i.id ?? generateUUID(),
                headerid: i.headerid ?? header.id,
                sku: i.sku,
                quantity: i.quantity ?? 0,
                status: i.status === 'Released' ? 'Released' : 'Booked',
            }));

            // Items removed from the cart that were in the original booking → emit as Released
            if (editing) {
                const currentIds = new Set(allItems.map(i => i.id).filter(Boolean));
                const currentSkus = new Set(allItems.map(i => i.sku));
                originalBookingItems.value.forEach(orig => {
                    // If this SKU exists in current items (any status), user already handled it
                    if (currentSkus.has(orig.sku)) return;
                    // Match by id as secondary check
                    if (orig.id && currentIds.has(orig.id)) return;
                    allItems.push({
                        id: orig.id ?? generateUUID(),
                        headerid: orig.headerid ?? header.id,
                        sku: orig.sku,
                        quantity: orig.quantity ?? 0,
                        status: 'Released',
                    });
                });
            }

            const activeOnly = allItems.filter(i => i.status !== 'Released');

            // Build detailed change_log entry
            const bn = header.bookingnumber || '-';
            const releasedItems = allItems.filter(i => i.status === 'Released');
            // Build orig lookup by id (supports duplicate SKUs)
            const origById = {};
            const origBySkuStatus = {};
            originalBookingItems.value.forEach(o => {
                if (o.id) origById[o.id] = o;
                const key = o.sku + '|' + (o.status === 'Released' ? 'Released' : '');
                if (!origBySkuStatus[key]) origBySkuStatus[key] = o;
            });
            function findOrig(item) {
                if (item.id && origById[item.id]) return origById[item.id];
                const key = item.sku + '|' + (item.status === 'Released' ? 'Released' : '');
                return origBySkuStatus[key] || null;
            }

            // Detect changes
            const added = [];
            const readdedFromReleased = [];
            const qtyChanged = [];
            const newlyReleased = [];

            if (editing) {
                // Build lookups by SKU for cross-status matching
                const origBySku = {};
                originalBookingItems.value.forEach(o => {
                    if (!origBySku[o.sku]) origBySku[o.sku] = o;
                });
                const origReleasedSkus = new Set(
                    originalBookingItems.value.filter(o => o.status === 'Released').map(o => o.sku)
                );
                // Active items: check if truly new, re-added from released, or qty changed
                activeOnly.forEach(c => {
                    const orig = findOrig(c);
                    const origAnySku = origBySku[c.sku];
                    if (!orig) {
                        if (origReleasedSkus.has(c.sku)) {
                            const fromQty = origAnySku ? origAnySku.quantity : null;
                            readdedFromReleased.push({ ...c, fromQty });
                        } else {
                            added.push(c);
                        }
                    } else if (orig.quantity !== c.quantity) {
                        qtyChanged.push({ sku: c.sku, from: orig.quantity, to: c.quantity });
                    }
                });
                // Newly released (was not Released before, now is Released — includes items removed from cart)
                releasedItems.forEach(c => {
                    const orig = findOrig(c);
                    if (!orig || orig.status !== 'Released') newlyReleased.push(c);
                });
            }

            // Build description parts
            const descParts = [];
            if (editing) {
                descParts.push(`In Booking ${bn}`);
                if (readdedFromReleased.length > 0) {
                    const details = readdedFromReleased.map(i => {
                        if (i.fromQty != null && i.fromQty !== i.quantity) {
                            return `${i.sku} from qty ${i.fromQty} to ${i.quantity}`;
                        }
                        return `${i.sku} qty ${i.quantity}`;
                    }).join(', ');
                    descParts.push(`re-added ${readdedFromReleased.length} line item(s) from released (${details})`);
                }
                if (added.length > 0) {
                    descParts.push(`added ${added.length} line item(s) (${added.map(i => `${i.sku} qty ${i.quantity}`).join(', ')})`);
                }
                if (qtyChanged.length > 0) {
                    const qtyDetails = qtyChanged.map(q => `${q.sku} from qty ${q.from} to ${q.to}`).join(', ');
                    descParts.push(`changed quantity of ${qtyChanged.length} line item(s) (${qtyDetails})`);
                }
                if (newlyReleased.length > 0) {
                    descParts.push(`released ${newlyReleased.length} line item(s) (${newlyReleased.map(i => i.sku).join(', ')})`);
                }
                if (added.length === 0 && readdedFromReleased.length === 0 && qtyChanged.length === 0 && newlyReleased.length === 0) {
                    descParts.push(`${activeOnly.length} active line item(s) confirmed with no changes (${activeOnly.map(i => i.sku).join(', ') || 'none'})`);
                }
                descParts.push(`via Inventory Booking Cart`);
            } else {
                descParts.push(`Booking ${bn} created with ${activeOnly.length} line item(s) (${activeOnly.map(i => `${i.sku} qty ${i.quantity}`).join(', ') || 'none'}) via Inventory Booking Cart`);
            }

            const changeLog = {
                id: generateUUID(),
                timestamp: klTimestamp(),
                category: 'Booking',
                action: editing
                    ? 'Booking Updated by User with Inventory Booking Cart'
                    : 'Booking Created by User with Inventory Booking Cart',
                description: descParts.join(', ') + '.',
                connection: header.id,
            };

            lastAttemptedAction.value = 'booking';
            emit('trigger-event', {
                name: 'booking',
                event: {
                    value: {
                        staging_status: 'Sending',
                        is_edit: editing,
                        booking_header: header,
                        booking_items: allItems,
                        updated_at: now,
                        change_log: changeLog,
                    },
                },
            });
        }

        // ── Dropdown helpers ──
        function onBookingSearchBlur() {
            setTimeout(() => { bookingDropdownOpen.value = false; bookingHighlightedIndex.value = -1; }, 150);
        }
        function selectBooking(header) {
            bookingDropdownOpen.value = false;
            bookingSearchQuery.value = '';
            if (!header) return;
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            if (isInputsDisabled.value) return;
            selectedBookingOption.value = header;
            const headerId = header.id;
            const items = bookingItemsData.value.filter(i => (i.header_id ?? i.headerid) === headerId);
            emit('trigger-event', {
                name: 'loadBooking',
                event: {
                    value: {
                        booking_header: {
                            id: header.id,
                            bookingnumber: getBookingNumber(header),
                            created_at: header.created_at,
                            bookingtitle: getBookingTitle(header),
                            pic_id: header.pic_id,
                        },
                        booking_items: items.map(i => ({
                            sku: i.sku,
                            quantity: i.quantity ?? 0,
                            status: i.status ?? null,
                        })),
                    },
                },
            });
        }
        function togglePICDropdown() {
            if (isInputsDisabled.value) return;
            picDropdownOpen.value = !picDropdownOpen.value;
            bookingDropdownOpen.value = false;
            if (picDropdownOpen.value) {
                picSearchQuery.value = '';
                nextTick(() => picSearchInput.value?.focus());
            }
        }
        function selectPIC(teammate) {
            if (teammate) {
                selectedPIC.value = teammate.id;
                selectedPICName.value = teammate.name;
            } else {
                selectedPIC.value = null;
                selectedPICName.value = '';
            }
            picDropdownOpen.value = false;
            picSearchQuery.value = '';
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
            getBookingNumber,
            getBookingTitle,
            getBookingPICName,
            formatBookingOption,
            formatShortDate,
            resolvedCart,
            activeCartItems,
            releasedCartItems,
            releasedOpen,
            changeLogOpen,
            currentChangeLogs,
            formatLogDate,
            statusBadgeStyle,
            resolvedBookingHeaders,
            filteredBookingHeaders,
            bookingSearchQuery,
            connectedBookingNumber,
            resolvedTeammates,
            filteredTeammates,
            picSearchQuery,
            picSearchInput,
            hasOverbooking,
            canConfirm,
            isConnectedWithEmptyCart,
            subtitle,
            itemCount,
            confirmLabel,
            picDropdownDisplay,
            bookingTitleWillUpdate,
            picWillUpdate,
            isConnected,
            stagingStatus,
            releasedBn,
            isTimedOut,
            isSending,
            isReleasing,
            isSuccessState,
            isInputsDisabled,
            cartHeader,
            successTeammateName,
            formattedBookingTime,
            bookingTitle,
            selectedPIC,
            selectedBookingOption,
            bookingDropdownOpen,
            picDropdownOpen,
            bookingSelectEl,
            picSelectEl,
            draftRows,
            draftInputRefs,
            draftDropdownRefs,
            bookingHighlightedIndex,
            bookingDropdownRef,
            filteredInventory,
            addDraftRow,
            removeDraftRow,
            selectSkuForDraft,
            onDraftSkuBlur,
            onDraftSkuKeydown,
            onBookingSearchBlur,
            onBookingSearchKeydown,
            updateQuantity,
            removeItem,
            disconnectBooking,
            emptyCart,
            onConfirmClick,
            confirmBooking,
            selectBooking,
            togglePICDropdown,
            selectPIC,
            emptyCartConfirm,
            onDismissFailure,
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
$orange: #ea580c;
$green: #059669;
$green-dark: #047857;
$gray-900: #111827;
$gray-700: #374151;
$gray-500: #6b7280;
$gray-400: #9ca3af;
$gray-300: #d1d5db;
$gray-200: #e5e7eb;
$gray-100: #f3f4f6;
$gray-50: #f9fafb;
$white: #ffffff;
$radius: 0;
$radius-sm: 0;
$transition: 0.15s ease;

/* ── Root container ── */
.inventory-booking-cart {
    position: relative;
    display: flex;
    flex-direction: row;
    gap: 0;
    width: 100%;
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 12px;
    color: $gray-900;
    overflow: hidden;

    &.is-sending .left-panel,
    &.is-sending .right-panel,
    &.is-releasing .left-panel,
    &.is-releasing .right-panel,
    &.is-success .left-panel,
    &.is-success .right-panel {
        pointer-events: none;
    }
    &.is-sending .btn-confirm,
    &.is-releasing .btn-confirm,
    &.is-success .confirm-area--elevated {
        pointer-events: auto;
    }
}

/* ── Success overlay ── */
.success-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.7);
    z-index: 40;
    pointer-events: auto;
}
.overlay-fade-enter-active,
.overlay-fade-leave-active {
    transition: opacity 0.25s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
    opacity: 0;
}

/* ═══════════ LEFT PANEL ═══════════ */
.left-panel {
    flex: 7;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 16px 20px;
}

.cart-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
}
.header-title {
    font-size: 12px;
    font-weight: 700;
    margin: 0;
    line-height: 1.3;
    color: $gray-900;
}
.header-subtitle {
    font-size: 12px;
    color: $gray-500;
    margin: 2px 0 0;
}
.header-count-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 2px;
    white-space: nowrap;
}
.count-text {
    font-size: 12px;
    color: $gray-500;
    font-weight: 500;
}
.btn-empty-cart {
    margin-left: auto;
    padding: 5px 10px;
    font-size: 11px;
    font-weight: 600;
    color: $gray-500;
    background: $gray-100;
    border: 1px solid $gray-200;
    border-radius: $radius-sm;
    cursor: pointer;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    transition: color $transition, background $transition, border-color $transition;
    &:hover:not(:disabled) {
        color: $gray-700;
        background: $gray-200;
        border-color: $gray-300;
    }
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    &.btn-empty-cart--confirm {
        color: $red-dark;
        background: #fef2f2;
        border-color: #fca5a5;
        &:hover:not(:disabled) {
            background: #fee2e2;
            border-color: $red-dark;
        }
    }
}

/* ── Add Item hint ── */
.add-item-hint {
    font-size: 11px;
    color: $gray-400;
    margin: 6px 0 0;
    text-align: center;
    font-style: italic;
}

/* ── Released section (collapsible) ── */
.released-section {
    margin-top: 8px;
    border-top: 1px solid $gray-100;
}
.released-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 0;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: $gray-400;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    transition: color $transition;
    &:hover { color: $gray-500; }
}
.released-chevron {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    transition: transform 0.2s ease;
    &.is-open { transform: rotate(90deg); }
}
.released-body {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.25s ease;
    &.is-open { grid-template-rows: 1fr; }
}
.released-inner {
    overflow: hidden;
}
.table-row--released {
    opacity: 0.5;
}
.released-qty {
    font-size: 12px;
    font-weight: 500;
    color: $gray-500;
}

/* ── Change Log section ── */
.changelog-section {
    margin-top: 4px;
    border-top: 1px solid $gray-100;
}
.changelog-scroll {
    max-height: 200px;
    overflow-y: auto;
}
.cl-entry {
    padding: 8px 0;
    border-bottom: 1px solid $gray-50;
    &:last-child { border-bottom: none; }
}
.cl-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 2px;
}
.cl-category {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    color: $gray-400;
    letter-spacing: 0.03em;
}
.cl-action {
    font-size: 11px;
    font-weight: 500;
    color: $gray-500;
}
.cl-time {
    margin-left: auto;
    font-size: 10px;
    color: $gray-300;
    white-space: nowrap;
}
.cl-desc {
    font-size: 11px;
    color: $gray-400;
    line-height: 1.4;
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
    padding-bottom: 8px;
    border-bottom: 1px solid $gray-200;
    margin-bottom: 2px;
}
.th {
    font-size: 12px;
    font-weight: 600;
    color: $gray-400;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}
.th-image   { width: 64px;  flex-shrink: 0; }
.th-details { flex: 1; }
.th-avail   { width: 120px; display: flex; align-items: center; justify-content: center; gap: 4px; flex-shrink: 0; }
.th-info    { display: inline-flex; align-items: center; cursor: help; color: $gray-400; }
.th-info .info-icon { width: 14px; height: 14px; flex-shrink: 0; }
.th-status  { width: 90px;  text-align: center; flex-shrink: 0; }
.th-qty     { width: 110px; text-align: center; flex-shrink: 0; }
.th-action  { width: 44px;  flex-shrink: 0; }

.table-body {
    display: flex;
    flex-direction: column;
}
.table-row {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid $gray-100;
    &:last-child { border-bottom: none; }
}
.td { display: flex; align-items: center; }
.td-image   { width: 64px;  flex-shrink: 0; justify-content: center; }
.td-details { flex: 1; flex-direction: column; align-items: flex-start; min-width: 0; }
.td-avail   { width: 120px; flex-direction: column; align-items: center; flex-shrink: 0; }
.td-status  { width: 90px;  justify-content: center; flex-shrink: 0; }
.td-qty     { width: 110px; justify-content: center; flex-shrink: 0; }
.td-action  { width: 44px;  justify-content: center; flex-shrink: 0; }

.product-img {
    width: 38px;
    height: 38px;
    border-radius: $radius-sm;
    object-fit: cover;
}
.product-img-placeholder {
    width: 38px;
    height: 38px;
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
    font-size: 12px;
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
    font-size: 12px;
    color: $gray-400;
    margin-top: 1px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    letter-spacing: 0.02em;
}

.avail-number {
    font-size: 12px;
    font-weight: 600;
    color: $gray-700;
}
.td-avail.is-over .avail-number {
    color: $red;
}
.td-avail.is-buffer .avail-number {
    color: $orange;
}
.over-limit-badge {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 12px;
    font-weight: 600;
    color: $red;
    margin-top: 2px;
    svg { flex-shrink: 0; }
}
.buffer-badge {
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 600;
    color: $orange;
    margin-top: 2px;
}
.status-badge {
    font-size: 12px;
    font-weight: 600;
    color: $gray-700;
    padding: 4px 8px;
    border-radius: $radius-sm;
    background: $gray-100;
}

.qty-input {
    width: 64px;
    height: 32px;
    border: 1.5px solid $gray-300;
    border-radius: $radius-sm;
    text-align: center;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 12px;
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
    padding: 16px 18px;
    gap: 14px;
}

.rp-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.rp-section--existing-top {
    margin-bottom: 10px;
}
.rp-label {
    font-size: 12px;
    font-weight: 600;
    color: $gray-700;
}
.label-updating {
    color: #b45309;
    font-weight: 600;
}
.rp-label--caps {
    font-size: 12px;
    font-weight: 700;
    color: $gray-400;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
}
.label-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
}

/* ── Connection badge ── */
.connection-badge {
    font-weight: 600;
    font-size: 10px;
    letter-spacing: 0.04em;
    color: $gray-400;
}
.connection-badge--on {
    color: $green;
}

/* ── Custom select ── */
.custom-select {
    position: relative;
}
.select-trigger {
    display: flex;
    align-items: center;
    width: 100%;
    height: 36px;
    padding: 0 12px;
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    background: $white;
    cursor: pointer;
    transition: border-color $transition;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 12px;
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
    max-height: 220px;
    overflow-y: auto;
}
.select-option {
    padding: 8px 12px;
    font-size: 12px;
    color: $gray-700;
    cursor: pointer;
    transition: background $transition;
    line-height: 1.4;
    &:hover { background: $gray-50; }
}
.select-option--placeholder {
    color: $gray-400;
    font-weight: 500;
    &:hover { background: rgba($blue, 0.04); }
}
.select-option--empty {
    color: $gray-400;
    cursor: default;
    font-style: italic;
    &:hover { background: transparent; }
}
.select-search-wrap {
    padding: 6px 8px;
    cursor: default;
    &:hover { background: transparent; }
}
.select-search-input {
    width: 100%;
    height: 32px;
    padding: 0 8px;
    border: 1px solid $gray-200;
    border-radius: 4px;
    font-size: 12px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: $gray-900;
    background: $white;
    outline: none;
    &::placeholder { color: $gray-400; }
    &:focus { border-color: $blue; }
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

/* ── Add Item button ── */
.btn-add-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    height: 42px;
    margin-top: 4px;
    padding: 0 16px;
    font-size: 12px;
    font-weight: 600;
    color: $blue;
    background: rgba($blue, 0.03);
    border: 1.5px dashed rgba($blue, 0.35);
    border-radius: $radius-sm;
    cursor: pointer;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    transition: background $transition, border-color $transition, color $transition;
    svg { width: 14px; height: 14px; flex-shrink: 0; }
    &:hover:not(:disabled) {
        background: rgba($blue, 0.08);
        border-color: $blue;
        color: $blue-dark;
    }
    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
}

/* ── Draft row ── */
.table-row--draft {
    background: $gray-50;
    border-radius: $radius-sm;
    margin: 2px 0;
    border-bottom: none !important;
}
.td-draft-search {
    padding-right: 8px;
}
.sku-search-wrap {
    position: relative;
    width: 100%;
}
.sku-search-input {
    width: 100%;
    height: 36px;
    padding: 0 10px;
    border: 1.5px solid $gray-300;
    border-radius: $radius-sm;
    font-size: 12px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: $gray-900;
    background: $white;
    outline: none;
    transition: border-color $transition;
    &::placeholder { color: $gray-400; }
    &:focus { border-color: $blue; }
}
.sku-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: $white;
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    z-index: 60;
    max-height: 240px;
    overflow-y: auto;
}
.sku-dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    cursor: pointer;
    transition: background $transition;
    &:hover { background: $gray-50; }
    &.is-highlighted { background: rgba($blue, 0.08); }
}
.dd-item-img {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
    &--placeholder {
        background: $gray-100;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $gray-400;
        svg { width: 18px; height: 18px; }
    }
}
.dd-item-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
}
.dd-item-model {
    font-size: 12px;
    font-weight: 600;
    color: $gray-900;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.dd-item-variant {
    font-size: 11px;
    color: $gray-500;
    margin-top: 1px;
}
.dd-item-sku {
    font-size: 11px;
    color: $gray-400;
    flex-shrink: 0;
    white-space: nowrap;
}

/* ── Booking search (inline, auto-connect) ── */
.booking-search-wrap {
    position: relative;
}
.booking-search-input {
    width: 100%;
    height: 36px;
    padding: 0 12px;
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    font-size: 12px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: $gray-900;
    background: $white;
    outline: none;
    transition: border-color $transition;
    box-sizing: border-box;
    &::placeholder { color: $gray-400; }
    &:focus { border-color: $blue; }
    &:disabled { background: $gray-50; cursor: default; }
}
.booking-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: $white;
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    z-index: 50;
    max-height: 220px;
    overflow-y: auto;
}
.booking-dropdown-item {
    padding: 8px 12px;
    font-size: 12px;
    color: $gray-700;
    cursor: pointer;
    transition: background $transition;
    line-height: 1.4;
    &:hover { background: $gray-50; }
    &.is-highlighted { background: rgba($blue, 0.08); }
    &--placeholder {
        color: $gray-400;
        font-weight: 500;
        cursor: default;
        &:hover { background: transparent; }
    }
    &--empty {
        color: $gray-400;
        cursor: default;
        font-style: italic;
        &:hover { background: transparent; }
    }
}

/* ── Connected booking chip ── */
.connected-booking-row {
    display: flex;
    align-items: stretch;
    gap: 8px;
}
.connected-chip {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 12px;
    background: rgba($green, 0.06);
    border: 1.5px solid rgba($green, 0.3);
    border-radius: $radius-sm;
}
.connected-bn {
    font-size: 12px;
    font-weight: 700;
    color: $green;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.connected-title {
    font-size: 11px;
    color: $gray-500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.connected-pic {
    font-size: 11px;
    color: $gray-400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.btn-disconnect {
    width: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid rgba($red, 0.3);
    border-radius: $radius-sm;
    background: rgba($red, 0.06);
    color: $red;
    cursor: pointer;
    transition: all $transition;
    svg { width: 16px; height: 16px; }
    &:hover { background: $red; color: $white; border-color: $red; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

/* ── Dropdown fade transition ── */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
    transition: opacity 0.12s ease, transform 0.12s ease;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

/* ── Input with icon ── */
.input-icon-wrap {
    display: flex;
    align-items: center;
    height: 36px;
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
        min-width: 0;
        height: 100%;
        border: none;
        outline: none;
        padding: 0;
        margin: 0;
        background: transparent;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-size: 12px !important;
        font-weight: 400 !important;
        line-height: 1.4 !important;
        color: $gray-900 !important;
        -webkit-appearance: none;
        appearance: none;
        &::placeholder,
        &::-webkit-input-placeholder,
        &::-moz-placeholder {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            font-size: 12px !important;
            font-weight: 400 !important;
            color: $gray-400;
        }
    }
}

/* ── Confirm area ── */
.confirm-area {
    display: flex;
    flex-direction: column;
}
.confirm-area--elevated {
    position: relative;
    z-index: 50;
    background: $white;
    border-radius: $radius;
    padding: 14px;
    margin: -6px -8px -8px;
}

/* ── Confirm button ── */
.btn-confirm {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 40px;
    border: none;
    border-radius: $radius-sm;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background $transition, opacity $transition;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    &.btn-confirm--release {
        background: $red;
        color: $white;
        &:hover { background: $red-dark; }
    }
    &.btn-confirm--sending {
        background: #111827;
        color: $white;
        cursor: wait;
        &:hover { background: #111827; }
    }
    &.btn-confirm--failed {
        background: $red;
        color: $white;
        &:hover { background: $red-dark; }
    }
    &.btn-confirm--success,
    &.btn-confirm--success-released {
        background: $green;
        color: $white;
        cursor: pointer;
        &:hover { background: $green-dark; }
    }
}
.confirm-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}
.confirm-icon--spin {
    animation: confirm-spin 1s linear infinite;
}
@keyframes confirm-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.booking-success-line {
    font-size: 12px;
    color: $gray-500;
    margin: 10px 0 0;
    line-height: 1.6;
    text-align: center;
}
.confirm-area--elevated .booking-success-line {
    color: $gray-700;
}
.booking-success-var {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-weight: 600;
}
.success-dismiss-hint {
    font-size: 11px;
    color: $gray-400;
    margin: 6px 0 0;
    text-align: center;
    font-style: italic;
}

/* ═══════════ RESPONSIVE ═══════════ */
@media (max-width: 900px) {
    .inventory-booking-cart {
        flex-direction: column;
    }
    .panel-divider {
        width: 100%;
        height: 1px;
    }
    .left-panel {
        flex: none;
    }
    .right-panel {
        flex: none;
        min-width: 0;
    }
}

@media (max-width: 640px) {
    .left-panel {
        padding: 16px;
    }
    .right-panel {
        padding: 16px;
        gap: 14px;
    }
    .cart-header {
        flex-direction: column;
        gap: 8px;
    }
    .header-count-row {
        width: 100%;
    }
    .th-image, .td-image {
        display: none;
    }
    .th-status, .td-status {
        display: none;
    }
    .th-avail, .td-avail {
        width: 80px;
    }
    .th-qty, .td-qty {
        width: 80px;
    }
    .qty-input {
        width: 56px;
    }
    .table-row {
        padding: 10px 0;
    }
    .empty-state {
        padding: 40px 16px;
    }
    .connected-booking-row {
        flex-direction: column;
    }
    .btn-disconnect {
        width: 100%;
        height: 36px;
    }
}

/* ── Failed dismiss ── */
.booking-failed-hint {
    font-size: 12px;
    color: $red-dark;
    margin: 6px 0 0;
}
.btn-failed-dismiss {
    background: none;
    border: none;
    color: $red-dark;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    font-family: inherit;
}

/* ── Dropdown truncation hint ── */
.sku-dropdown-hint {
    padding: 6px 12px;
    font-size: 11px;
    color: $gray-400;
    text-align: center;
    border-top: 1px solid $gray-200;
    pointer-events: none;
}
</style>

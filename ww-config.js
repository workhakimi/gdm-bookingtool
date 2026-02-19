/**
 * Inventory Booking Cart – Two-panel cart with Connect/Disconnect for existing
 * booking, Quick Add SKU, Confirm / Proceed (Overbooked).
 * Events: On Booking, On Overbooking, On Remove From Cart only.
 */

export default {
  editor: {
    label: { en: 'Inventory Booking Cart' },
    icon: 'shopping-cart',
    customSettingsPropertiesOrder: [
      'referenceData',
      'cartData',
      'teammatesList',
      'buffer',
      'bookingHeaders',
      'bookingItems',
      'bookingTitlePlaceholder',
      'picPlaceholder',
      'quickAddPlaceholder',
      'confirmButtonText',
      'proceedOverbookingText',
    ],
    customStylePropertiesOrder: [
      'fontSize',
      'cellColor',
      'textColor',
      'borderRadius',
      'inputBorderColor',
      'buttonColor',
    ],
  },
  triggerEvents: [
    {
      name: 'booked',
      label: { en: 'On Booking' },
      event: {
        value: {
          isEdit: false,
          headerId: null,
          created_at: '',
          updated_at: '',
          pic_uuid: '',
          BookingNumber: '',
          BookingItems: [{ SKU: '', Quantity: 0 }],
        },
      },
      getTestEvent: 'getBookedTestEvent',
      default: true,
    },
    {
      name: 'overbooking',
      label: { en: 'On Overbooking' },
      event: { value: { overbooked: true } },
      getTestEvent: 'getOverbookingTestEvent',
    },
    {
      name: 'removeFromCart',
      label: { en: 'On Remove From Cart' },
      event: { cart: [] },
      getTestEvent: 'getCartUpdateTestEvent',
    },
  ],
  properties: {
    referenceData: {
      label: { en: 'Reference data (Inventory)' },
      type: 'ObjectList',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Supabase Inventory_Data collection (SKU, Model, Color, SNT, ImageLink, etc.).',
      },
      /* wwEditor:end */
    },
    cartData: {
      label: { en: 'Cart data' },
      type: 'ObjectList',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Variable: list of { SKU, Quantity }. Updated via On Remove From Cart; also add from inventory list.',
      },
      /* wwEditor:end */
    },
    teammatesList: {
      label: { en: 'Teammates list' },
      type: 'ObjectList',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Teammates collection (id, Name). Used for Person In Charge dropdown.',
      },
      /* wwEditor:end */
    },
    buffer: {
      label: { en: 'Buffer' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: false,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'If on, available quantity = SNT - 25 from reference. No UI toggle.',
      },
      /* wwEditor:end */
    },
    bookingHeaders: {
      label: { en: 'Booking_Headers collection' },
      type: 'ObjectList',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Booking_Headers (id, BookingNumber, BookingTitle, PIC_ID). For Existing Booking dropdown.',
      },
      /* wwEditor:end */
    },
    bookingItems: {
      label: { en: 'Booking_Items collection' },
      type: 'ObjectList',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Booking_Items (id, HeaderID, SKU, Quantity). Loaded when Connect is clicked.',
      },
      /* wwEditor:end */
    },
    bookingTitlePlaceholder: {
      label: { en: 'Booking title placeholder' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'e.g. Q4 Internal Event',
    },
    picPlaceholder: {
      label: { en: 'Person In Charge placeholder' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Select Teammate.....',
    },
    quickAddPlaceholder: {
      label: { en: 'Quick Add SKU placeholder' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Scan or type SKU...',
    },
    confirmButtonText: {
      label: { en: 'Confirm button text' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Confirm Booking',
    },
    proceedOverbookingText: {
      label: { en: 'Proceed overbooking text' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Proceed (Overbooked)',
    },
    // —— Style ——
    fontSize: {
      label: { en: 'Font size' },
      type: 'Number',
      section: 'style',
      defaultValue: 12,
      options: { min: 10, max: 24, step: 1 },
      bindable: true,
    },
    cellColor: {
      label: { en: 'Cell background' },
      type: 'Color',
      section: 'style',
      options: { nullable: true },
      defaultValue: '#ffffff',
    },
    textColor: {
      label: { en: 'Text color' },
      type: 'Color',
      section: 'style',
      options: { nullable: true },
      defaultValue: '#1e293b',
    },
    borderRadius: {
      label: { en: 'Border radius' },
      type: 'Length',
      section: 'style',
      options: { noRange: true },
      defaultValue: '8px',
    },
    inputBorderColor: {
      label: { en: 'Input border color' },
      type: 'Color',
      section: 'style',
      options: { nullable: true },
      defaultValue: '#e2e8f0',
    },
    buttonColor: {
      label: { en: 'Button color' },
      type: 'Color',
      section: 'style',
      options: { nullable: true },
      defaultValue: '#2563eb',
    },
  },
};

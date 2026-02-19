/**
 * Inventory Booking Cart – Cart of SKUs with quantity inputs, manual SKU add,
 * booking title/PIC, edit existing booking, proceed/overbooking, emit On Booked.
 * Bindable: reference data, cart data, teammates, buffer, Booking_Headers, Booking_Items.
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
      'editingHeaderId',
      'bookingTitlePlaceholder',
      'picPlaceholder',
      'manualSkuPlaceholder',
      'proceedButtonText',
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
      name: 'manualAddSku',
      label: { en: 'On Manual Add SKU' },
      event: {
        value: {
          SKU: '',
          Model: '',
          Color: '',
          SNT: 0,
          ImageLink: '',
          Type: '',
          Size: '',
          Tags: '',
        },
      },
      getTestEvent: 'getManualAddSkuTestEvent',
    },
    {
      name: 'removeFromCart',
      label: { en: 'On Remove From Cart' },
      event: { cart: [] },
      getTestEvent: 'getCartUpdateTestEvent',
    },
    {
      name: 'qtyChange',
      label: { en: 'On Quantity Change' },
      event: { cart: [] },
      getTestEvent: 'getCartUpdateTestEvent',
    },
    {
      name: 'reorderCart',
      label: { en: 'On Reorder Cart' },
      event: { cart: [] },
      getTestEvent: 'getCartUpdateTestEvent',
    },
    {
      name: 'loadBooking',
      label: { en: 'On Load Booking (Edit)' },
      event: {
        headerId: '',
        bookingNumber: '',
        bookingTitle: '',
        picId: '',
        cart: [],
      },
      getTestEvent: 'getLoadBookingTestEvent',
    },
    {
      name: 'booked',
      label: { en: 'On Booked' },
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
        tooltip: 'Variable: list of { SKU, Quantity }. Updated via On Remove / On Quantity Change / On Reorder / On Load Booking.',
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
        tooltip: 'Teammates collection (id, Name). Used for PIC dropdown and edit booking display.',
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
        tooltip: 'If on, available quantity = SNT - 25 from reference.',
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
        tooltip: 'Booking_Headers (id, BookingNumber, BookingTitle, PIC_ID, created_at).',
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
        tooltip: 'Booking_Items (id, HeaderID, SKU, Quantity). Used to load booking when editing.',
      },
      /* wwEditor:end */
    },
    editingHeaderId: {
      label: { en: 'Editing booking (Header ID)' },
      type: 'Text',
      section: 'settings',
      defaultValue: '',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'UUID of Booking_Header when editing. Set by workflow on On Load Booking; clear for new booking.',
      },
      /* wwEditor:end */
    },
    bookingTitlePlaceholder: {
      label: { en: 'Booking title placeholder' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Booking title',
    },
    picPlaceholder: {
      label: { en: 'PIC placeholder' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Select PIC',
    },
    manualSkuPlaceholder: {
      label: { en: 'Manual SKU input placeholder' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Add SKU by code, press Enter',
    },
    proceedButtonText: {
      label: { en: 'Proceed button text' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Proceed',
    },
    proceedOverbookingText: {
      label: { en: 'Proceed overbooking text' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Proceed Overbooking',
    },
    // —— Style ——
    fontSize: {
      label: { en: 'Font size' },
      type: 'Number',
      section: 'style',
      defaultValue: 14,
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

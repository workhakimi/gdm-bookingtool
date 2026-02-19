export default {
    editor: {
        label: { en: 'Inventory Booking Cart' },
        icon: 'shopping-cart',
        customSettingsPropertiesOrder: [
            {
                label: 'Data Sources',
                isCollapsible: true,
                properties: [
                    'referenceData',
                    'cartData',
                    'teammatesList',
                    'bookingHeaders',
                    'bookingItems',
                ],
            },
            {
                label: 'Options',
                isCollapsible: true,
                properties: ['buffer'],
            },
        ],
    },
    triggerEvents: [
        {
            name: 'clearCart',
            label: { en: 'On Clear Cart' },
            event: {
                value: {
                    Booking_Header: { id: null, BookingNumber: null, created_at: null, BookingTitle: null, PIC_ID: null },
                    Booking_Items: [],
                },
            },
            default: false,
        },
        {
            name: 'manualAdd',
            label: { en: 'On Manual Add' },
            event: {
                value: { SKU: null, Quantity: 0, Status: null },
            },
            default: false,
        },
        {
            name: 'removeFromCart',
            label: { en: 'On Remove From Cart' },
            event: {
                value: {
                    Booking_Header: { id: null, BookingNumber: null, created_at: null, BookingTitle: null, PIC_ID: null },
                    Booking_Items: [],
                },
            },
            default: false,
        },
        {
            name: 'quantityChange',
            label: { en: 'On Quantity Change' },
            event: {
                value: {
                    Booking_Header: { id: null, BookingNumber: null, created_at: null, BookingTitle: null, PIC_ID: null },
                    Booking_Items: [],
                },
            },
            default: false,
        },
        {
            name: 'overbooking',
            label: { en: 'On Overbooking' },
            event: {
                value: {
                    overbooked: true,
                    Booking_Header: { id: null, BookingNumber: null, created_at: null, BookingTitle: null, PIC_ID: null },
                    Booking_Items: [],
                },
            },
            default: false,
        },
        {
            name: 'loadBooking',
            label: { en: 'On Load Booking' },
            event: {
                value: {
                    Booking_Header: {
                        id: null,
                        BookingNumber: null,
                        created_at: null,
                        BookingTitle: null,
                        PIC_ID: null,
                    },
                    Booking_Items: [
                        { SKU: null, Quantity: null, Status: null },
                    ],
                },
            },
            default: false,
        },
        {
            name: 'booking',
            label: { en: 'On Booking' },
            event: {
                value: {
                    StagingStatus: 'Sending',
                    isEdit: false,
                    Booking_Header: { id: null, BookingNumber: null, created_at: null, BookingTitle: null, PIC_ID: null },
                    Booking_Items: [],
                    updated_at: null,
                },
            },
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
                tooltip: 'Array of { SKU, Model, Color, Size, SNT, ImageLink }',
            },
            /* wwEditor:end */
        },
        cartData: {
            label: { en: 'Cart data' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: null,
            /* wwEditor:start */
            bindingValidation: {
                type: 'object',
                tooltip: '{ Booking_Header: { id, BookingNumber, created_at, BookingTitle, PIC_ID, updated_at? }, Booking_Items: [...], StagingStatus?: null | "Sending" | "Successful" }',
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
                tooltip: 'Array of { id, Name }',
            },
            /* wwEditor:end */
        },
        bookingHeaders: {
            label: { en: 'Booking Headers' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of { id, BookingNumber, BookingTitle, PIC_ID }',
            },
            /* wwEditor:end */
        },
        bookingItems: {
            label: { en: 'Booking Items' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of { id, HeaderID, SKU, Quantity }',
            },
            /* wwEditor:end */
        },
        buffer: {
            label: { en: 'Buffer (SNT − 25)' },
            type: 'OnOff',
            section: 'settings',
            bindable: true,
            defaultValue: false,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'When on, available = SNT − 25. When off, available = SNT.',
            },
            /* wwEditor:end */
        },
    },
};

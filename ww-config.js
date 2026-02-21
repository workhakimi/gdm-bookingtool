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
                    booking_header: { id: null, bookingnumber: null, created_at: null, bookingtitle: null, pic_id: null },
                    booking_items: [],
                },
            },
            default: false,
        },
        {
            name: 'manualAdd',
            label: { en: 'On Manual Add' },
            event: {
                value: { sku: null, quantity: 0, status: null },
            },
            default: false,
        },
        {
            name: 'removeFromCart',
            label: { en: 'On Remove From Cart' },
            event: {
                value: {
                    booking_header: { id: null, bookingnumber: null, created_at: null, bookingtitle: null, pic_id: null },
                    booking_items: [],
                },
            },
            default: false,
        },
        {
            name: 'quantityChange',
            label: { en: 'On Quantity Change' },
            event: {
                value: {
                    booking_header: { id: null, bookingnumber: null, created_at: null, bookingtitle: null, pic_id: null },
                    booking_items: [],
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
                    booking_header: { id: null, bookingnumber: null, created_at: null, bookingtitle: null, pic_id: null },
                    booking_items: [],
                },
            },
            default: false,
        },
        {
            name: 'loadBooking',
            label: { en: 'On Load Booking' },
            event: {
                value: {
                    booking_header: {
                        id: null,
                        bookingnumber: null,
                        created_at: null,
                        bookingtitle: null,
                        pic_id: null,
                    },
                    booking_items: [
                        { sku: null, quantity: null, status: null },
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
                    staging_status: 'Sending',
                    is_edit: false,
                    booking_header: { id: null, bookingnumber: null, created_at: null, bookingtitle: null, pic_id: null },
                    booking_items: [],
                    updated_at: null,
                },
            },
            default: true,
        },
        {
            name: 'successDismiss',
            label: { en: 'On Success Dismiss' },
            event: {
                value: {
                    booking_header: { id: null, bookingnumber: null, created_at: null, bookingtitle: null, pic_id: null },
                    booking_items: [],
                    staging_status: null,
                },
            },
            default: false,
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
                tooltip: 'Array of { sku, model, color, size, snt, image_link }',
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
                tooltip: '{ booking_header: { id, bookingnumber, created_at, bookingtitle, pic_id, updated_at? }, booking_items: [...], staging_status?: null | "Sending" | "Successful" }',
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
                tooltip: 'Array of { id, name }',
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
                tooltip: 'Array of { id, bookingnumber, bookingtitle, pic_id, created_at? }',
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
                tooltip: 'Array of { id, header_id or headerid, sku, quantity, status? }',
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

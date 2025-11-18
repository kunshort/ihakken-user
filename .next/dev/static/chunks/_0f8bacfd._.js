(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/api/restaurant.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "restaurantApi",
    ()=>restaurantApi,
    "useGetCategoriesQuery",
    ()=>useGetCategoriesQuery,
    "useGetMenuItemByIdQuery",
    ()=>useGetMenuItemByIdQuery,
    "useGetMenuItemsQuery",
    ()=>useGetMenuItemsQuery,
    "useSearchMenuItemsQuery",
    ()=>useSearchMenuItemsQuery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/rtk-query.modern.mjs [app-client] (ecmascript)");
;
// Base query configuration
const baseQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchBaseQuery"])({
    baseUrl: "/api"
});
const restaurantApi = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: "restaurantApi",
    baseQuery,
    endpoints: (builder)=>({
            // Get all menu items
            getMenuItems: builder.query({
                queryFn: async ()=>{
                    try {
                        // Replace with actual API endpoint
                        const response = await fetch("/api/menu-items");
                        if (!response.ok) throw new Error("Failed to fetch menu items");
                        const data = await response.json();
                        return {
                            data
                        };
                    } catch (error) {
                        return {
                            error: error instanceof Error ? error.message : "Unknown error"
                        };
                    }
                }
            }),
            // Get single menu item by ID
            getMenuItemById: builder.query({
                queryFn: async (id)=>{
                    try {
                        const response = await fetch(`/api/menu-items/${id}`);
                        if (!response.ok) throw new Error("Failed to fetch menu item");
                        const data = await response.json();
                        return {
                            data
                        };
                    } catch (error) {
                        return {
                            error: error instanceof Error ? error.message : "Unknown error"
                        };
                    }
                }
            }),
            // Get categories
            getCategories: builder.query({
                queryFn: async ()=>{
                    try {
                        const response = await fetch("/api/categories");
                        if (!response.ok) throw new Error("Failed to fetch categories");
                        const data = await response.json();
                        return {
                            data
                        };
                    } catch (error) {
                        return {
                            error: error instanceof Error ? error.message : "Unknown error"
                        };
                    }
                }
            }),
            // Search menu items
            searchMenuItems: builder.query({
                queryFn: async (query)=>{
                    try {
                        const response = await fetch(`/api/menu-items/search?q=${encodeURIComponent(query)}`);
                        if (!response.ok) throw new Error("Failed to search menu items");
                        const data = await response.json();
                        return {
                            data
                        };
                    } catch (error) {
                        return {
                            error: error instanceof Error ? error.message : "Unknown error"
                        };
                    }
                }
            })
        })
});
const { useGetMenuItemsQuery, useGetMenuItemByIdQuery, useGetCategoriesQuery, useSearchMenuItemsQuery } = restaurantApi;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/api/lodging.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "lodgingApi",
    ()=>lodgingApi,
    "useGetAccommodationByIdQuery",
    ()=>useGetAccommodationByIdQuery,
    "useGetAccommodationsQuery",
    ()=>useGetAccommodationsQuery,
    "useGetLodgingCategoriesQuery",
    ()=>useGetLodgingCategoriesQuery,
    "useSearchAccommodationsQuery",
    ()=>useSearchAccommodationsQuery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/rtk-query.modern.mjs [app-client] (ecmascript)");
;
// Base query configuration
const baseQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchBaseQuery"])({
    baseUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_BASE_URL || ""
});
const lodgingApi = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: "lodgingApi",
    baseQuery,
    endpoints: (builder)=>({
            getAccommodations: builder.query({
                query: (branchId)=>`/api/v1/core/branches/${branchId}/services/lodging`,
                transformResponse: (response)=>{
                    return Array.isArray(response.data) ? response.data : [];
                }
            }),
            getAccommodationById: builder.query({
                query: ({ branchId, accommodationId })=>`/api/v1/core/branches/${branchId}/services/lodging/${accommodationId}`,
                transformResponse: (response)=>response.data
            }),
            getLodgingCategories: builder.query({
                query: (branchId)=>`/api/v1/core/branches/${branchId}/services/lodging/categories`,
                transformResponse: (response)=>response.data || []
            }),
            searchAccommodations: builder.query({
                query: ({ branchId, query })=>`/api/v1/core/branches/${branchId}/services/lodging/search?q=${encodeURIComponent(query)}`,
                transformResponse: (response)=>{
                    return Array.isArray(response.data) ? response.data : [];
                }
            })
        })
});
const { useGetAccommodationsQuery, useGetAccommodationByIdQuery, useGetLodgingCategoriesQuery, useSearchAccommodationsQuery } = lodgingApi;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/api/base.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "baseQuery",
    ()=>baseQuery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/rtk-query.modern.mjs [app-client] (ecmascript)");
;
const baseQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchBaseQuery"])({
    baseUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com",
    prepareHeaders: (headers)=>{
        return headers;
    }
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/api/services-api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "servicesApi",
    ()=>servicesApi,
    "useGetServicesByBranchQuery",
    ()=>useGetServicesByBranchQuery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$base$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/base.ts [app-client] (ecmascript)");
;
;
const servicesApi = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: "servicesApi",
    baseQuery: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$base$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["baseQuery"],
    tagTypes: [
        "Services"
    ],
    endpoints: (builder)=>({
            getServicesByBranch: builder.query({
                query: ({ branchId, serviceSlug })=>{
                    let url = `/api/v1/core/branches/${branchId}/services/`;
                    if (serviceSlug) {
                        url += `?services=${serviceSlug}`;
                    }
                    return url;
                },
                transformResponse: (response)=>response.data,
                providesTags: (data, error, arg)=>[
                        {
                            type: "Services",
                            id: arg.branchId
                        }
                    ]
            })
        })
});
const { useGetServicesByBranchQuery } = servicesApi;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "store",
    ()=>store
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$restaurant$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/restaurant.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$lodging$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/lodging.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$services$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/services-api.ts [app-client] (ecmascript)");
;
;
;
;
const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["configureStore"])({
    reducer: {
        [__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$restaurant$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["restaurantApi"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$restaurant$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["restaurantApi"].reducer,
        [__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$lodging$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lodgingApi"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$lodging$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lodgingApi"].reducer,
        [__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$services$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["servicesApi"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$services$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["servicesApi"].reducer
    },
    middleware: (getDefaultMiddleware)=>getDefaultMiddleware().concat(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$restaurant$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["restaurantApi"].middleware).concat(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$lodging$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lodgingApi"].middleware).concat(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$services$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["servicesApi"].middleware)
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-client] (ecmascript)");
"use client";
;
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Provider"], {
        store: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["store"],
        children: children
    }, void 0, false, {
        fileName: "[project]/components/providers.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0f8bacfd._.js.map
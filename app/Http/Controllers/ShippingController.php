<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\ShippingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ShippingController extends Controller
{
    protected $shippingService;

    public function __construct(ShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    /**
     * Get delivery methods and carriers for checkout
     */
    public function getMethods(Request $request): JsonResponse
    {
        $request->validate([
            'street_address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'zip_code' => 'required|string|max:20',
        ]);

        try {
            $address = [
                'street_address' => $request->street_address,
                'city' => $request->city,
                'state' => $request->state,
                'zip_code' => $request->zip_code,
            ];

            // Get cart items for package dimension calculation and per-store breakdown
            $cartItems = [];
            if (auth()->check()) {
                $cartItems = auth()->user()->cartItems()->with('product.store')->get()->toArray();
            } else {
                // For anonymous users, build cart items from AnonymousCart cart_data
                $sessionId = session()->getId();
                $anonymousCart = \App\Models\AnonymousCart::where('session_id', $sessionId)->first();
                if ($anonymousCart && !empty($anonymousCart->cart_data)) {
                    $productIds = array_column($anonymousCart->cart_data, 'product_id');
                    $products = \App\Models\Product::with('store')->whereIn('id', $productIds)->get()->keyBy('id');
                    foreach ($anonymousCart->cart_data as $item) {
                        $product = $products->get($item['product_id'] ?? null);
                        if ($product) {
                            $cartItems[] = [
                                'quantity' => (int) ($item['quantity'] ?? 1),
                                'product' => [
                                    'store_id' => $product->store_id,
                                    'store' => $product->store ? ['id' => (string) $product->store->id, 'name' => $product->store->name] : null,
                                ],
                            ];
                        }
                    }
                }
            }
            
            $result = $this->shippingService->getDeliveryMethods($address, $cartItems);

            return response()->json([
                'success' => true,
                'delivery_methods' => $result['delivery_methods'],
                'carriers' => $result['carriers'],
                'shipping_breakdown' => $result['shipping_breakdown'] ?? [],
            ]);

        } catch (\Exception $e) {
            // Check if it's a configuration error
            if (str_contains($e->getMessage(), 'not properly configured')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Shipping service is not configured. Please contact support.',
                    'error_type' => 'configuration_error'
                ], 503);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate delivery methods: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get shipping rates for an order
     */
    public function getRates(Request $request, Order $order): JsonResponse
    {
        $rates = $this->shippingService->calculateShippingRates($order);

        return response()->json($rates);
    }

    /**
     * Create shipping label for an order
     */
    public function createLabel(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'rate_id' => 'required|string',
        ]);

        $result = $this->shippingService->createShippingLabel($order, $request->rate_id);

        return response()->json($result);
    }

    /**
     * Track shipment
     */
    public function track(Request $request): JsonResponse
    {
        $request->validate([
            'tracking_code' => 'required|string',
        ]);

        $result = $this->shippingService->trackShipment($request->tracking_code);

        return response()->json($result);
    }

}

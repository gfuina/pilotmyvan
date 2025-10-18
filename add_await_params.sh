#!/bin/bash

# Manually add await params in equipment-brands route
echo "You need to manually add 'const { id } = await params;' in each route handler that uses params.id"
echo "This is needed for Next.js 15 breaking change"
echo ""
echo "Files to update:"
echo "- app/api/admin/equipment-brands/[id]/route.ts"
echo "- app/api/admin/equipments/[id]/*.ts"
echo "- app/api/admin/maintenances/[id]/route.ts"
echo "- app/api/admin/vehicle-brands/[id]/route.ts"
echo "- app/api/equipments/[id]/maintenances/route.ts"
echo "- app/api/vehicles/[id]/route.ts"
echo "- app/api/vehicles/[id]/equipments/route.ts"
echo "- app/api/vehicles/[id]/maintenances/*.ts"
echo "- app/api/vehicles/[id]/equipments/[vehicleEquipmentId]/**/*.ts"


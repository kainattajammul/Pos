import { Router } from "express";
import { BranchOperationsController as C } from "../controllers/branchOperations.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  authenticateRequest,
  requireBranchContext,
  requireBranchPermission,
} from "../middleware/branchStaffAccess.middleware.js";
import { BRANCH_OPERATIONS_PERMISSIONS as P } from "../constants/branchOperationsPermissions.js";
import {
  branchOpsContextRules,
  createAppointmentRules,
  createCustomerRules,
  createRepairRules,
  createSaleRules,
  listQueryRules,
  operationsSettingsUpdateRules,
  postcodeCheckRules,
  uuidParam,
} from "../validators/branchOperations.validator.js";

const router = Router({ mergeParams: true });
router.use(authenticateRequest, requireBranchContext);

router.get("/operations-settings", requireBranchPermission(P.OPERATIONS_VIEW), branchOpsContextRules, validateRequest, asyncHandler(C.getOperationsSettings));
router.patch("/operations-settings", requireBranchPermission(P.OPERATIONS_VIEW), operationsSettingsUpdateRules, validateRequest, asyncHandler(C.updateOperationsSettings));

router.get("/sales", requireBranchPermission(P.SALES_VIEW), listQueryRules, validateRequest, asyncHandler(C.listSales));
router.post("/sales", requireBranchPermission(P.SALES_CREATE), createSaleRules, validateRequest, asyncHandler(C.createSale));
router.get("/sales-summary", requireBranchPermission(P.SALES_VIEW_SUMMARY), branchOpsContextRules, validateRequest, asyncHandler(C.salesSummary));
router.get("/sales/:saleUuid", requireBranchPermission(P.SALES_VIEW), uuidParam("saleUuid"), validateRequest, asyncHandler(C.getSale));
router.post("/sales/:saleUuid/complete", requireBranchPermission(P.SALES_COMPLETE), uuidParam("saleUuid"), validateRequest, asyncHandler(C.completeSale));
router.post("/sales/:saleUuid/cancel", requireBranchPermission(P.SALES_CANCEL), uuidParam("saleUuid"), validateRequest, asyncHandler(C.cancelSale));

router.get("/repairs", requireBranchPermission(P.REPAIRS_VIEW), listQueryRules, validateRequest, asyncHandler(C.listRepairs));
router.post("/repairs", requireBranchPermission(P.REPAIRS_CREATE), createRepairRules, validateRequest, asyncHandler(C.createRepair));
router.get("/repairs/:repairUuid", requireBranchPermission(P.REPAIRS_VIEW), uuidParam("repairUuid"), validateRequest, asyncHandler(C.getRepair));
router.post("/repairs/:repairUuid/assign-technician", requireBranchPermission(P.REPAIRS_ASSIGN), uuidParam("repairUuid"), validateRequest, asyncHandler(C.assignTechnician));
router.post("/repairs/:repairUuid/change-status", requireBranchPermission(P.REPAIRS_CHANGE_STATUS), uuidParam("repairUuid"), validateRequest, asyncHandler(C.changeRepairStatus));
router.post("/repairs/:repairUuid/diagnosis", requireBranchPermission(P.REPAIRS_ADD_DIAGNOSIS), uuidParam("repairUuid"), validateRequest, asyncHandler(C.addDiagnosis));
router.post("/repairs/:repairUuid/estimate", requireBranchPermission(P.REPAIRS_CREATE_ESTIMATE), uuidParam("repairUuid"), validateRequest, asyncHandler(C.createEstimate));
router.post("/repairs/:repairUuid/customer-approval", requireBranchPermission(P.REPAIRS_UPDATE), uuidParam("repairUuid"), validateRequest, asyncHandler(C.customerApproval));
router.post("/repairs/:repairUuid/complete", requireBranchPermission(P.REPAIRS_COMPLETE), uuidParam("repairUuid"), validateRequest, asyncHandler(C.completeRepair));
router.post("/repairs/:repairUuid/ready-for-collection", requireBranchPermission(P.REPAIRS_COMPLETE), uuidParam("repairUuid"), validateRequest, asyncHandler(C.readyForCollection));
router.post("/repairs/:repairUuid/collect", requireBranchPermission(P.REPAIRS_COMPLETE), uuidParam("repairUuid"), validateRequest, asyncHandler(C.collectRepair));
router.post("/repairs/:repairUuid/cancel", requireBranchPermission(P.REPAIRS_CANCEL), uuidParam("repairUuid"), validateRequest, asyncHandler(C.cancelRepair));
router.post("/repairs/:repairUuid/archive", requireBranchPermission(P.REPAIRS_ARCHIVE), uuidParam("repairUuid"), validateRequest, asyncHandler(C.archiveRepair));

router.get("/repair-capacity", requireBranchPermission(P.REPAIR_CAPACITY_VIEW), branchOpsContextRules, validateRequest, asyncHandler(C.getCapacity));
router.put("/repair-capacity", requireBranchPermission(P.REPAIR_CAPACITY_MANAGE), branchOpsContextRules, validateRequest, asyncHandler(C.putCapacity));
router.get("/repair-capacity/availability", requireBranchPermission(P.REPAIR_CAPACITY_VIEW), branchOpsContextRules, validateRequest, asyncHandler(C.capacityAvailability));

router.get("/appointment-availability", requireBranchPermission(P.APPOINTMENTS_VIEW), branchOpsContextRules, validateRequest, asyncHandler(C.appointmentAvailability));
router.get("/appointment-slots", requireBranchPermission(P.APPOINTMENTS_VIEW), branchOpsContextRules, validateRequest, asyncHandler(C.appointmentSlots));
router.get("/appointments", requireBranchPermission(P.APPOINTMENTS_VIEW), listQueryRules, validateRequest, asyncHandler(C.listAppointments));
router.post("/appointments", requireBranchPermission(P.APPOINTMENTS_CREATE), createAppointmentRules, validateRequest, asyncHandler(C.createAppointment));
router.get("/appointments/:appointmentUuid", requireBranchPermission(P.APPOINTMENTS_VIEW), uuidParam("appointmentUuid"), validateRequest, asyncHandler(C.getAppointment));
router.post("/appointments/:appointmentUuid/reschedule", requireBranchPermission(P.APPOINTMENTS_UPDATE), uuidParam("appointmentUuid"), validateRequest, asyncHandler(C.rescheduleAppointment));
router.post("/appointments/:appointmentUuid/cancel", requireBranchPermission(P.APPOINTMENTS_CANCEL), uuidParam("appointmentUuid"), validateRequest, asyncHandler(C.cancelAppointment));
router.post("/appointments/:appointmentUuid/check-in", requireBranchPermission(P.APPOINTMENTS_UPDATE), uuidParam("appointmentUuid"), validateRequest, asyncHandler(C.checkInAppointment));
router.post("/appointments/:appointmentUuid/complete", requireBranchPermission(P.APPOINTMENTS_UPDATE), uuidParam("appointmentUuid"), validateRequest, asyncHandler(C.completeAppointment));
router.post("/appointments/:appointmentUuid/no-show", requireBranchPermission(P.APPOINTMENTS_UPDATE), uuidParam("appointmentUuid"), validateRequest, asyncHandler(C.noShowAppointment));

router.get("/operation-options", requireBranchPermission(P.OPERATIONS_VIEW), branchOpsContextRules, validateRequest, asyncHandler(C.getOperationOptions));
router.patch("/operation-options", requireBranchPermission(P.OPERATIONS_MANAGE_PICKUP), branchOpsContextRules, validateRequest, asyncHandler(C.updateOperationOptions));

router.get("/dropoff-rules", requireBranchPermission(P.OPERATIONS_VIEW), branchOpsContextRules, validateRequest, asyncHandler(C.listDropoffRules));
router.post("/dropoff-rules", requireBranchPermission(P.OPERATIONS_MANAGE_DROPOFF), branchOpsContextRules, validateRequest, asyncHandler(C.createDropoffRule));
router.patch("/dropoff-rules/:ruleUuid", requireBranchPermission(P.OPERATIONS_MANAGE_DROPOFF), uuidParam("ruleUuid"), validateRequest, asyncHandler(C.updateDropoffRule));
router.delete("/dropoff-rules/:ruleUuid", requireBranchPermission(P.OPERATIONS_MANAGE_DROPOFF), uuidParam("ruleUuid"), validateRequest, asyncHandler(C.deleteDropoffRule));

router.get("/service-areas", requireBranchPermission(P.OPERATIONS_VIEW), branchOpsContextRules, validateRequest, asyncHandler(C.listServiceAreas));
router.post("/service-areas", requireBranchPermission(P.OPERATIONS_MANAGE_SERVICE_AREAS), branchOpsContextRules, validateRequest, asyncHandler(C.createServiceArea));
router.patch("/service-areas/:areaUuid", requireBranchPermission(P.OPERATIONS_MANAGE_SERVICE_AREAS), uuidParam("areaUuid"), validateRequest, asyncHandler(C.updateServiceArea));
router.delete("/service-areas/:areaUuid", requireBranchPermission(P.OPERATIONS_MANAGE_SERVICE_AREAS), uuidParam("areaUuid"), validateRequest, asyncHandler(C.deleteServiceArea));
router.post("/service-areas/check-postcode", requireBranchPermission(P.OPERATIONS_VIEW), postcodeCheckRules, validateRequest, asyncHandler(C.checkPostcode));

router.get("/deliveries", requireBranchPermission(P.OPERATIONS_VIEW), listQueryRules, validateRequest, asyncHandler(C.listDeliveries));
router.post("/deliveries", requireBranchPermission(P.OPERATIONS_MANAGE_DELIVERY), branchOpsContextRules, validateRequest, asyncHandler(C.createDelivery));

router.get("/customers", requireBranchPermission(P.CUSTOMERS_VIEW), listQueryRules, validateRequest, asyncHandler(C.listCustomers));
router.post("/customers", requireBranchPermission(P.CUSTOMERS_CREATE), createCustomerRules, validateRequest, asyncHandler(C.createCustomer));
router.get("/customers/:customerUuid", requireBranchPermission(P.CUSTOMERS_VIEW), uuidParam("customerUuid"), validateRequest, asyncHandler(C.getCustomer));
router.patch("/customers/:customerUuid", requireBranchPermission(P.CUSTOMERS_UPDATE), uuidParam("customerUuid"), validateRequest, asyncHandler(C.updateCustomer));
router.get("/customers/:customerUuid/activity", requireBranchPermission(P.CUSTOMERS_VIEW_ACTIVITY), uuidParam("customerUuid"), validateRequest, asyncHandler(C.listCustomerActivity));

router.get("/customer-visibility-rules", requireBranchPermission(P.CUSTOMERS_VIEW), branchOpsContextRules, validateRequest, asyncHandler(C.getVisibilityRules));
router.patch("/customer-visibility-rules", requireBranchPermission(P.CUSTOMERS_MANAGE_VISIBILITY), branchOpsContextRules, validateRequest, asyncHandler(C.updateVisibilityRules));

router.get("/warranties", requireBranchPermission(P.WARRANTIES_VIEW), listQueryRules, validateRequest, asyncHandler(C.listWarranties));
router.post("/warranties", requireBranchPermission(P.WARRANTIES_CREATE), branchOpsContextRules, validateRequest, asyncHandler(C.createWarranty));
router.get("/warranty-claims", requireBranchPermission(P.WARRANTY_CLAIMS_VIEW), listQueryRules, validateRequest, asyncHandler(C.listWarrantyClaims));
router.post("/warranties/:warrantyUuid/claims", requireBranchPermission(P.WARRANTY_CLAIMS_CREATE), uuidParam("warrantyUuid"), validateRequest, asyncHandler(C.createWarrantyClaim));
router.post("/warranty-claims/:claimUuid/review", requireBranchPermission(P.WARRANTY_CLAIMS_REVIEW), uuidParam("claimUuid"), validateRequest, asyncHandler(C.reviewClaim));
router.post("/warranty-claims/:claimUuid/approve", requireBranchPermission(P.WARRANTY_CLAIMS_APPROVE), uuidParam("claimUuid"), validateRequest, asyncHandler(C.approveClaim));
router.post("/warranty-claims/:claimUuid/reject", requireBranchPermission(P.WARRANTY_CLAIMS_REJECT), uuidParam("claimUuid"), validateRequest, asyncHandler(C.rejectClaim));
router.post("/warranty-claims/:claimUuid/complete", requireBranchPermission(P.WARRANTY_CLAIMS_COMPLETE), uuidParam("claimUuid"), validateRequest, asyncHandler(C.completeClaim));

export default router;

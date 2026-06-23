import * as Settings from "../services/branchOperationsSettings.service.js";
import * as Sales from "../services/branchSales.service.js";
import * as SalesSummary from "../services/branchSalesSummary.service.js";
import * as Repair from "../services/branchRepair.service.js";
import * as Capacity from "../services/branchRepairCapacity.service.js";
import * as ApptAvail from "../services/branchAppointmentAvailability.service.js";
import * as Appointment from "../services/branchAppointment.service.js";
import * as OpOptions from "../services/branchOperationOptions.service.js";
import * as Dropoff from "../services/branchDropoffRule.service.js";
import * as ServiceArea from "../services/branchServiceArea.service.js";
import * as Delivery from "../services/branchDelivery.service.js";
import * as Customer from "../services/branchCustomer.service.js";
import * as Activity from "../services/branchCustomerActivity.service.js";
import * as Visibility from "../services/branchCustomerVisibility.service.js";
import * as Warranty from "../services/branchWarranty.service.js";

function ctx(req) {
  return {
    shopId: req.shopId,
    branchUuid: req.params.branchUuid,
    userId: req.authContext?.userId,
    req,
    permissions: req.operationsPermissions ?? {},
  };
}

export const BranchOperationsController = {
  getOperationsSettings(req, res) {
    return Settings.getOperationsSettings(ctx(req)).then((data) => res.json({ success: true, data }));
  },
  updateOperationsSettings(req, res) {
    return Settings.updateOperationsSettings({ ...ctx(req), input: req.body }).then((data) =>
      res.json({ success: true, data }),
    );
  },

  listSales(req, res) {
    return Sales.listSales({ ...ctx(req), query: req.query }).then((r) => res.json({ success: true, ...r }));
  },
  createSale(req, res) {
    return Sales.createSale({ ...ctx(req), input: req.body }).then((data) =>
      res.status(201).json({ success: true, data }),
    );
  },
  getSale(req, res) {
    return Sales.getSale({ ...ctx(req), saleUuid: req.params.saleUuid }).then((data) =>
      res.json({ success: true, data }),
    );
  },
  completeSale(req, res) {
    return Sales.completeSale({
      ...ctx(req),
      saleUuid: req.params.saleUuid,
      payments: req.body.payments,
    }).then((data) => res.json({ success: true, data }));
  },
  cancelSale(req, res) {
    return Sales.cancelSale({
      ...ctx(req),
      saleUuid: req.params.saleUuid,
      reason: req.body.reason,
    }).then((data) => res.json({ success: true, data }));
  },
  salesSummary(req, res) {
    return SalesSummary.getSalesSummary({ ...ctx(req), query: req.query }).then((data) =>
      res.json({ success: true, data }),
    );
  },

  listRepairs(req, res) {
    return Repair.listRepairTickets({ ...ctx(req), query: req.query }).then((r) =>
      res.json({ success: true, ...r }),
    );
  },
  createRepair(req, res) {
    return Repair.createRepairTicket({ ...ctx(req), input: req.body }).then((data) =>
      res.status(201).json({ success: true, data }),
    );
  },
  getRepair(req, res) {
    return Repair.getRepairTicket({ ...ctx(req), ticketUuid: req.params.repairUuid }).then((data) =>
      res.json({ success: true, data }),
    );
  },
  assignTechnician(req, res) {
    return Repair.assignTechnician({
      ...ctx(req),
      ticketUuid: req.params.repairUuid,
      technicianUuid: req.body.technician_id,
    }).then((data) => res.json({ success: true, data }));
  },
  changeRepairStatus(req, res) {
    return Repair.changeRepairStatus({
      ...ctx(req),
      ticketUuid: req.params.repairUuid,
      status: req.body.status,
      notes: req.body.notes,
    }).then((data) => res.json({ success: true, data }));
  },
  addDiagnosis(req, res) {
    return Repair.addDiagnosis({
      ...ctx(req),
      ticketUuid: req.params.repairUuid,
      diagnosis: req.body.diagnosis,
    }).then((data) => res.json({ success: true, data }));
  },
  createEstimate(req, res) {
    return Repair.createEstimate({ ...ctx(req), ticketUuid: req.params.repairUuid, ...req.body }).then(
      (data) => res.json({ success: true, data }),
    );
  },
  customerApproval(req, res) {
    return Repair.recordCustomerApproval({ ...ctx(req), ticketUuid: req.params.repairUuid, ...req.body }).then(
      (data) => res.json({ success: true, data }),
    );
  },
  completeRepair(req, res) {
    return Repair.completeRepair({
      ...ctx(req),
      ticketUuid: req.params.repairUuid,
      finalCost: req.body.final_cost,
    }).then((data) => res.json({ success: true, data }));
  },
  readyForCollection(req, res) {
    return Repair.markReadyForCollection({ ...ctx(req), ticketUuid: req.params.repairUuid }).then((data) =>
      res.json({ success: true, data }),
    );
  },
  collectRepair(req, res) {
    return Repair.collectRepair({ ...ctx(req), ticketUuid: req.params.repairUuid }).then((data) =>
      res.json({ success: true, data }),
    );
  },
  cancelRepair(req, res) {
    return Repair.cancelRepair({
      ...ctx(req),
      ticketUuid: req.params.repairUuid,
      reason: req.body.reason,
    }).then((data) => res.json({ success: true, data }));
  },
  archiveRepair(req, res) {
    return Repair.archiveRepair({ ...ctx(req), ticketUuid: req.params.repairUuid }).then((data) =>
      res.json({ success: true, data }),
    );
  },

  getCapacity(req, res) {
    return Capacity.getCapacityRules({ ...ctx(req), query: req.query }).then((data) =>
      res.json({ success: true, data }),
    );
  },
  putCapacity(req, res) {
    return Capacity.putCapacityRules({ ...ctx(req), rules: req.body.rules ?? [] }).then((data) =>
      res.json({ success: true, data }),
    );
  },
  capacityAvailability(req, res) {
    return Capacity.getRepairAvailabilityForDate({
      ...ctx(req),
      date: req.query.date,
      deviceCategory: req.query.device_category,
    }).then((data) => res.json({ success: true, data }));
  },

  appointmentAvailability(req, res) {
    return ApptAvail.getAvailableSlots({
      ...ctx(req),
      serviceId: req.query.service_id,
      date: req.query.date,
      durationMinutes: req.query.duration_minutes,
    }).then((data) => res.json({ success: true, data }));
  },
  appointmentSlots(req, res) {
    return ApptAvail.getAvailableSlots({
      ...ctx(req),
      serviceId: req.query.service_id,
      date: req.query.date,
      durationMinutes: req.query.duration_minutes,
    }).then((data) => res.json({ success: true, data }));
  },
  listAppointments(req, res) {
    return Appointment.listAppointments({ ...ctx(req), query: req.query }).then((r) =>
      res.json({ success: true, ...r }),
    );
  },
  createAppointment(req, res) {
    return Appointment.createAppointment({ ...ctx(req), input: req.body }).then((data) =>
      res.status(201).json({ success: true, data }),
    );
  },
  getAppointment(req, res) {
    return Appointment.getAppointment({ ...ctx(req), appointmentUuid: req.params.appointmentUuid }).then(
      (data) => res.json({ success: true, data }),
    );
  },
  rescheduleAppointment(req, res) {
    return Appointment.rescheduleAppointment({
      ...ctx(req),
      appointmentUuid: req.params.appointmentUuid,
      startsAt: req.body.starts_at,
      endsAt: req.body.ends_at,
    }).then((data) => res.json({ success: true, data }));
  },
  cancelAppointment(req, res) {
    return Appointment.cancelAppointment({
      ...ctx(req),
      appointmentUuid: req.params.appointmentUuid,
      reason: req.body.reason,
    }).then((data) => res.json({ success: true, data }));
  },
  checkInAppointment(req, res) {
    return Appointment.checkInAppointment({ ...ctx(req), appointmentUuid: req.params.appointmentUuid }).then(
      (data) => res.json({ success: true, data }),
    );
  },
  completeAppointment(req, res) {
    return Appointment.completeAppointment({ ...ctx(req), appointmentUuid: req.params.appointmentUuid }).then(
      (data) => res.json({ success: true, data }),
    );
  },
  noShowAppointment(req, res) {
    return Appointment.markAppointmentNoShow({ ...ctx(req), appointmentUuid: req.params.appointmentUuid }).then(
      (data) => res.json({ success: true, data }),
    );
  },

  getOperationOptions(req, res) {
    return OpOptions.getOperationOptions(ctx(req)).then((data) => res.json({ success: true, data }));
  },
  updateOperationOptions(req, res) {
    return OpOptions.updateOperationOptions({ ...ctx(req), input: req.body }).then((data) =>
      res.json({ success: true, data }),
    );
  },

  listDropoffRules(req, res) {
    return Dropoff.listDropoffRules({ ...ctx(req), query: req.query }).then((r) =>
      res.json({ success: true, ...r }),
    );
  },
  createDropoffRule(req, res) {
    return Dropoff.createDropoffRule({ ...ctx(req), input: req.body }).then((data) =>
      res.status(201).json({ success: true, data }),
    );
  },
  updateDropoffRule(req, res) {
    return Dropoff.updateDropoffRule({
      ...ctx(req),
      ruleUuid: req.params.ruleUuid,
      input: req.body,
    }).then((data) => res.json({ success: true, data }));
  },
  deleteDropoffRule(req, res) {
    return Dropoff.deleteDropoffRule({ ...ctx(req), ruleUuid: req.params.ruleUuid }).then((data) =>
      res.json({ success: true, data }),
    );
  },

  listServiceAreas(req, res) {
    return ServiceArea.listServiceAreas({ ...ctx(req), query: req.query }).then((r) =>
      res.json({ success: true, ...r }),
    );
  },
  createServiceArea(req, res) {
    return ServiceArea.createServiceArea({ ...ctx(req), input: req.body }).then((data) =>
      res.status(201).json({ success: true, data }),
    );
  },
  updateServiceArea(req, res) {
    return ServiceArea.updateServiceArea({
      ...ctx(req),
      areaUuid: req.params.areaUuid,
      input: req.body,
    }).then((data) => res.json({ success: true, data }));
  },
  deleteServiceArea(req, res) {
    return ServiceArea.deleteServiceArea({ ...ctx(req), areaUuid: req.params.areaUuid }).then((data) =>
      res.json({ success: true, data }),
    );
  },
  checkPostcode(req, res) {
    return ServiceArea.checkPostcodeCoverage({
      ...ctx(req),
      postcode: req.body.postcode,
      city: req.body.city,
      county: req.body.county,
      country: req.body.country,
    }).then((data) => res.json({ success: true, data }));
  },

  listDeliveries(req, res) {
    return Delivery.listDeliveries({ ...ctx(req), query: req.query }).then((r) =>
      res.json({ success: true, ...r }),
    );
  },
  createDelivery(req, res) {
    return Delivery.createDelivery({ ...ctx(req), input: req.body }).then((data) =>
      res.status(201).json({ success: true, data }),
    );
  },

  listCustomers(req, res) {
    return Customer.listCustomers({ ...ctx(req), query: req.query }).then((r) =>
      res.json({ success: true, ...r }),
    );
  },
  createCustomer(req, res) {
    return Customer.createCustomer({ ...ctx(req), input: req.body }).then((data) =>
      res.status(201).json({ success: true, data }),
    );
  },
  getCustomer(req, res) {
    return Customer.getCustomer({ ...ctx(req), customerUuid: req.params.customerUuid }).then((data) =>
      res.json({ success: true, data }),
    );
  },
  updateCustomer(req, res) {
    return Customer.updateCustomer({
      ...ctx(req),
      customerUuid: req.params.customerUuid,
      input: req.body,
    }).then((data) => res.json({ success: true, data }));
  },
  listCustomerActivity(req, res) {
    return Activity.listCustomerActivities({
      ...ctx(req),
      customerUuid: req.params.customerUuid,
      query: req.query,
    }).then((r) => res.json({ success: true, ...r }));
  },
  getVisibilityRules(req, res) {
    return Visibility.getVisibilityRules(ctx(req)).then((data) => res.json({ success: true, data }));
  },
  updateVisibilityRules(req, res) {
    return Visibility.updateVisibilityRules({ ...ctx(req), input: req.body }).then((data) =>
      res.json({ success: true, data }),
    );
  },

  listWarranties(req, res) {
    return Warranty.listWarranties({ ...ctx(req), query: req.query }).then((r) =>
      res.json({ success: true, ...r }),
    );
  },
  createWarranty(req, res) {
    return Warranty.createWarranty({ ...ctx(req), input: req.body }).then((data) =>
      res.status(201).json({ success: true, data }),
    );
  },
  listWarrantyClaims(req, res) {
    return Warranty.listWarrantyClaims({ ...ctx(req), query: req.query }).then((r) =>
      res.json({ success: true, ...r }),
    );
  },
  createWarrantyClaim(req, res) {
    return Warranty.createWarrantyClaim({
      ...ctx(req),
      warrantyUuid: req.params.warrantyUuid,
      input: req.body,
    }).then((data) => res.status(201).json({ success: true, data }));
  },
  reviewClaim(req, res) {
    return Warranty.reviewWarrantyClaim({
      ...ctx(req),
      claimUuid: req.params.claimUuid,
      notes: req.body.notes,
    }).then((data) => res.json({ success: true, data }));
  },
  approveClaim(req, res) {
    return Warranty.approveWarrantyClaim({
      ...ctx(req),
      claimUuid: req.params.claimUuid,
      notes: req.body.notes,
    }).then((data) => res.json({ success: true, data }));
  },
  rejectClaim(req, res) {
    return Warranty.rejectWarrantyClaim({
      ...ctx(req),
      claimUuid: req.params.claimUuid,
      reason: req.body.reason,
    }).then((data) => res.json({ success: true, data }));
  },
  completeClaim(req, res) {
    return Warranty.completeWarrantyClaim({
      ...ctx(req),
      claimUuid: req.params.claimUuid,
      notes: req.body.notes,
    }).then((data) => res.json({ success: true, data }));
  },
};

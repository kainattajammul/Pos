import * as CommunicationSettingsService from "../services/branchCommunicationSettings.service.js";
import * as NotificationService from "../services/branchNotification.service.js";
import * as DocumentSettingsService from "../services/branchDocumentSettings.service.js";
import * as SenderSettingsService from "../services/branchSenderSettings.service.js";
import * as TemplateService from "../services/branchMessageTemplate.service.js";
import { TEMPLATE_VARIABLES } from "../constants/communicationEnums.js";

function ctx(req) {
  return {
    shopId: req.shopId,
    branchUuid: req.params.branchUuid,
    userId: req.authContext?.userId ?? req.user?.id,
    req,
    permissions: req.communicationPermissions ?? {},
  };
}

export const BranchCommunicationController = {
  async getCommunicationSettings(req, res) {
    const data = await CommunicationSettingsService.getCommunicationSettings(ctx(req));
    res.json({ success: true, data });
  },

  async updateCommunicationSettings(req, res) {
    const data = await CommunicationSettingsService.updateCommunicationSettings({
      ...ctx(req),
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async getNotificationSettings(req, res) {
    const data = await NotificationService.getNotificationSettings(ctx(req));
    res.json({ success: true, data });
  },

  async updateNotificationSettings(req, res) {
    const data = await NotificationService.updateNotificationSettings({
      ...ctx(req),
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async getDocumentSettings(req, res) {
    const data = await DocumentSettingsService.getDocumentSettings(ctx(req));
    res.json({ success: true, data });
  },

  async updateDocumentSettings(req, res) {
    const data = await DocumentSettingsService.updateDocumentSettings({
      ...ctx(req),
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async uploadLogo(req, res) {
    const data = await DocumentSettingsService.uploadBranchLogo({
      ...ctx(req),
      file: req.file,
    });
    res.json({ success: true, data });
  },

  async listDocuments(req, res) {
    const result = await DocumentSettingsService.listDocuments({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async signedDocumentUrl(req, res) {
    const data = await DocumentSettingsService.createSignedDocumentUrl({
      ...ctx(req),
      documentUuid: req.params.documentUuid,
    });
    res.json({ success: true, data });
  },

  async getReceiptSettings(req, res) {
    const data = await SenderSettingsService.getReceiptSettings(ctx(req));
    res.json({ success: true, data });
  },

  async updateReceiptSettings(req, res) {
    const data = await SenderSettingsService.updateReceiptSettings({ ...ctx(req), input: req.body });
    res.json({ success: true, data });
  },

  async getInvoiceSettings(req, res) {
    const data = await SenderSettingsService.getInvoiceSettings(ctx(req));
    res.json({ success: true, data });
  },

  async updateInvoiceSettings(req, res) {
    const data = await SenderSettingsService.updateInvoiceSettings({ ...ctx(req), input: req.body });
    res.json({ success: true, data });
  },

  async getEmailSenderSettings(req, res) {
    const data = await SenderSettingsService.getEmailSenderSettings(ctx(req));
    res.json({ success: true, data });
  },

  async updateEmailSenderSettings(req, res) {
    const data = await SenderSettingsService.updateEmailSenderSettings({ ...ctx(req), input: req.body });
    res.json({ success: true, data });
  },

  async testEmailSender(req, res) {
    const data = await SenderSettingsService.testEmailSender(ctx(req));
    res.json({ success: true, data });
  },

  async getSmsSenderSettings(req, res) {
    const data = await SenderSettingsService.getSmsSenderSettings(ctx(req));
    res.json({ success: true, data });
  },

  async updateSmsSenderSettings(req, res) {
    const data = await SenderSettingsService.updateSmsSenderSettings({ ...ctx(req), input: req.body });
    res.json({ success: true, data });
  },

  async testSmsSender(req, res) {
    const data = await SenderSettingsService.testSmsSender(ctx(req));
    res.json({ success: true, data });
  },

  async listMessageTemplates(req, res) {
    const result = await TemplateService.listMessageTemplates({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async createMessageTemplate(req, res) {
    const data = await TemplateService.createMessageTemplate({ ...ctx(req), input: req.body });
    res.status(201).json({ success: true, data });
  },

  async updateMessageTemplate(req, res) {
    const data = await TemplateService.updateMessageTemplate({
      ...ctx(req),
      templateUuid: req.params.templateUuid,
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async previewMessageTemplate(req, res) {
    const data = await TemplateService.previewMessageTemplate({
      ...ctx(req),
      templateUuid: req.params.templateUuid,
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async listCommunications(req, res) {
    const result = await TemplateService.listCommunications({
      ...ctx(req),
      query: req.query,
      permissions: { canViewRecipient: true },
    });
    res.json({ success: true, ...result });
  },

  async sendEmail(req, res) {
    const data = await TemplateService.queueCommunication({
      ...ctx(req),
      input: { ...req.body, channel: "email" },
    });
    res.status(201).json({ success: true, data });
  },

  async sendSms(req, res) {
    const data = await TemplateService.queueCommunication({
      ...ctx(req),
      input: { ...req.body, channel: "sms" },
    });
    res.status(201).json({ success: true, data });
  },

  async getTemplateVariables(req, res) {
    res.json({ success: true, data: TEMPLATE_VARIABLES });
  },
};

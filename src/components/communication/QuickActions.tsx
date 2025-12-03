'use client';

/**
 * Communication Quick Actions Component
 * One-click SMS, email, and call buttons for deal/buyer cards
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MessageSquare, Mail, Phone, MoreHorizontal, Send, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QuickActionsProps {
  contactPhone?: string;
  contactEmail?: string;
  contactName?: string;
  leadId?: string;
  dealId?: string;
  buyerId?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'icon-only';
}

export function QuickActions({
  contactPhone,
  contactEmail,
  contactName,
  leadId,
  dealId,
  buyerId,
  className,
  variant = 'default',
}: QuickActionsProps) {
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [smsMessage, setSmsMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const handleSendSMS = async () => {
    if (!contactPhone || !smsMessage.trim()) return;
    setIsSending(true);
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contactPhone,
          body: smsMessage,
          lead_id: leadId,
          deal_id: dealId,
          buyer_id: buyerId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('SMS sent successfully');
        setSmsDialogOpen(false);
        setSmsMessage('');
      } else {
        toast.error(data.error || 'Failed to send SMS');
      }
    } catch (error) {
      toast.error('Failed to send SMS');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendEmail = async () => {
    if (!contactEmail || !emailSubject.trim() || !emailBody.trim()) return;
    setIsSending(true);
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contactEmail,
          subject: emailSubject,
          body: emailBody,
          lead_id: leadId,
          deal_id: dealId,
          buyer_id: buyerId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Email sent successfully');
        setEmailDialogOpen(false);
        setEmailSubject('');
        setEmailBody('');
      } else {
        toast.error(data.error || 'Failed to send email');
      }
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleCall = () => {
    if (contactPhone) {
      window.location.href = `tel:${contactPhone}`;
    }
  };

  if (variant === 'icon-only') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setSmsDialogOpen(true)}
          disabled={!contactPhone}
          title="Send SMS"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setEmailDialogOpen(true)}
          disabled={!contactEmail}
          title="Send Email"
        >
          <Mail className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleCall}
          disabled={!contactPhone}
          title="Call"
        >
          <Phone className="h-4 w-4" />
        </Button>

        {/* Dialogs */}
        <SMSDialog
          open={smsDialogOpen}
          onOpenChange={setSmsDialogOpen}
          contactName={contactName}
          contactPhone={contactPhone}
          message={smsMessage}
          onMessageChange={setSmsMessage}
          onSend={handleSendSMS}
          isSending={isSending}
        />
        <EmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          contactName={contactName}
          contactEmail={contactEmail}
          subject={emailSubject}
          body={emailBody}
          onSubjectChange={setEmailSubject}
          onBodyChange={setEmailBody}
          onSend={handleSendEmail}
          isSending={isSending}
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSmsDialogOpen(true)}
          disabled={!contactPhone}
        >
          <MessageSquare className="h-4 w-4 mr-1" /> SMS
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEmailDialogOpen(true)}
          disabled={!contactEmail}
        >
          <Mail className="h-4 w-4 mr-1" /> Email
        </Button>

        <SMSDialog
          open={smsDialogOpen}
          onOpenChange={setSmsDialogOpen}
          contactName={contactName}
          contactPhone={contactPhone}
          message={smsMessage}
          onMessageChange={setSmsMessage}
          onSend={handleSendSMS}
          isSending={isSending}
        />
        <EmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          contactName={contactName}
          contactEmail={contactEmail}
          subject={emailSubject}
          body={emailBody}
          onSubjectChange={setEmailSubject}
          onBodyChange={setEmailBody}
          onSend={handleSendEmail}
          isSending={isSending}
        />
      </div>
    );
  }

  // Default variant with dropdown
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Send className="h-4 w-4 mr-2" />
            Contact
            <MoreHorizontal className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setSmsDialogOpen(true)} disabled={!contactPhone}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Send SMS
            {!contactPhone && (
              <Badge variant="secondary" className="ml-2 text-xs">
                No phone
              </Badge>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEmailDialogOpen(true)} disabled={!contactEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
            {!contactEmail && (
              <Badge variant="secondary" className="ml-2 text-xs">
                No email
              </Badge>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCall} disabled={!contactPhone}>
            <Phone className="h-4 w-4 mr-2" />
            Call
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <FileText className="h-4 w-4 mr-2" />
            Use Template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SMSDialog
        open={smsDialogOpen}
        onOpenChange={setSmsDialogOpen}
        contactName={contactName}
        contactPhone={contactPhone}
        message={smsMessage}
        onMessageChange={setSmsMessage}
        onSend={handleSendSMS}
        isSending={isSending}
      />
      <EmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        contactName={contactName}
        contactEmail={contactEmail}
        subject={emailSubject}
        body={emailBody}
        onSubjectChange={setEmailSubject}
        onBodyChange={setEmailBody}
        onSend={handleSendEmail}
        isSending={isSending}
      />
    </div>
  );
}

// SMS Dialog Component
interface SMSDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName?: string;
  contactPhone?: string;
  message: string;
  onMessageChange: (message: string) => void;
  onSend: () => void;
  isSending: boolean;
}

function SMSDialog({
  open,
  onOpenChange,
  contactName,
  contactPhone,
  message,
  onMessageChange,
  onSend,
  isSending,
}: SMSDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send SMS</DialogTitle>
          <DialogDescription>
            Send a text message to {contactName || contactPhone}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>To</Label>
            <Input value={contactPhone || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sms-message">Message</Label>
            <Textarea
              id="sms-message"
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Type your message..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/160 characters
              {message.length > 160 && ` (${Math.ceil(message.length / 160)} segments)`}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSend} disabled={isSending || !message.trim()}>
            {isSending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send SMS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Email Dialog Component
interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName?: string;
  contactEmail?: string;
  subject: string;
  body: string;
  onSubjectChange: (subject: string) => void;
  onBodyChange: (body: string) => void;
  onSend: () => void;
  isSending: boolean;
}

function EmailDialog({
  open,
  onOpenChange,
  contactName,
  contactEmail,
  subject,
  body,
  onSubjectChange,
  onBodyChange,
  onSend,
  isSending,
}: EmailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>Send an email to {contactName || contactEmail}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>To</Label>
            <Input value={contactEmail || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-subject">Subject</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder="Email subject..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-body">Message</Label>
            <Textarea
              id="email-body"
              value={body}
              onChange={(e) => onBodyChange(e.target.value)}
              placeholder="Type your message..."
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSend} disabled={isSending || !subject.trim() || !body.trim()}>
            {isSending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default QuickActions;

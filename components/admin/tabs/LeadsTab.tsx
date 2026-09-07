"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Clock, CheckCircle2, MessageSquare, Filter } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  gymName?: string;
  phone: string;
  email?: string;
  equipmentInterested: string;
  status: "new" | "contacted" | "quoted" | "closed";
  date: string;
  notes?: string;
}

export default function LeadsTab() {
  const [filter, setFilter] = useState<string>("all");
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "lead-1",
      name: "Vikram Singh",
      gymName: "Apex Fitness Studio",
      phone: "+91 98112 45890",
      email: "vikram@apexfit.in",
      equipmentInterested: "LP - BOLD 7000 Treadmills (4 units)",
      status: "new",
      date: "Today, 10:45 AM",
      notes: "Looking to replace existing club treadmills by end of this month.",
    },
    {
      id: "lead-2",
      name: "Dr. Ananya Sharma",
      gymName: "Personal Home Gym",
      phone: "+91 97188 33412",
      equipmentInterested: "Ski-Erg / Air-Bike Conditioning Setup",
      status: "contacted",
      date: "Yesterday",
      notes: "Sent brochure on WhatsApp. Client evaluating ceiling height for ski erg.",
    },
    {
      id: "lead-3",
      name: "Karan Malhotra",
      gymName: "Gold Standard Gym Rohini",
      phone: "+91 99990 12345",
      email: "karan@goldstandard.com",
      equipmentInterested: "Full Cardio Section (Treadmills, Spin Bikes, Rowers)",
      status: "quoted",
      date: "04 Sep 2026",
      notes: "Quotation sent via Invoice Generator #JF-2026-003.",
    },
  ]);

  const updateLeadStatus = (id: string, newStatus: Lead["status"]) => {
    setLeads(leads.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
  };

  const filteredLeads =
    filter === "all" ? leads : leads.filter((l) => l.status === filter);

  const getStatusBadge = (status: Lead["status"]) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-100 text-blue-800 border-none">New</Badge>;
      case "contacted":
        return <Badge className="bg-amber-100 text-amber-800 border-none">Contacted</Badge>;
      case "quoted":
        return <Badge className="bg-purple-100 text-purple-800 border-none">Quoted</Badge>;
      case "closed":
        return <Badge className="bg-emerald-100 text-emerald-800 border-none">Closed / Won</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Customer Inquiries & Consultations</CardTitle>
            <CardDescription>
              Track potential gym setup clients, inbound requests, and quotation followups.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-steel" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-ink/15 bg-white px-2.5 py-1.5 text-xs text-ink outline-none"
            >
              <option value="all">All Inquiries ({leads.length})</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="quoted">Quoted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex flex-col gap-4 rounded-xl border border-ink/10 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between hover:border-ink/20 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{lead.name}</span>
                    {lead.gymName && (
                      <span className="rounded bg-paper px-2 py-0.5 text-xs text-steel font-medium">
                        {lead.gymName}
                      </span>
                    )}
                    {getStatusBadge(lead.status)}
                  </div>
                  <div className="text-xs text-steel flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Phone size={12} /> {lead.phone}
                    </span>
                    {lead.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} /> {lead.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {lead.date}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-ink/90 pt-1">
                    Interest: <span className="text-gold-deep">{lead.equipmentInterested}</span>
                  </p>
                  {lead.notes && (
                    <p className="text-[11px] text-steel italic">
                      Notes: {lead.notes}
                    </p>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <select
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead["status"])}
                    className="rounded-md border border-ink/15 bg-white px-2 py-1 text-xs text-ink outline-none"
                  >
                    <option value="new">Mark New</option>
                    <option value="contacted">Mark Contacted</option>
                    <option value="quoted">Mark Quoted</option>
                    <option value="closed">Mark Closed</option>
                  </select>

                  <a
                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center gap-1 rounded-md bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700"
                  >
                    <MessageSquare size={13} /> WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Mail, Phone, Building2, Globe, MapPin } from "lucide-react";

interface ContactDetailViewProps {
  contactId: Id<"contacts">;
}

export function ContactDetailView({ contactId }: ContactDetailViewProps) {
  const contact = useQuery(api.contacts.get, { contactId });
  const activities = useQuery(api.activities.listByContact, { contactId });
  const router = useRouter();

  if (!contact) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    New: "outline",
    Contacted: "secondary",
    Qualified: "default",
    ProposalSent: "default",
    Won: "default",
    Lost: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{contact.firstName} {contact.lastName}</h1>
          <p className="text-muted-foreground">{contact.company ?? "No company"} {contact.jobTitle ? `- ${contact.jobTitle}` : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusColors[contact.status] ?? "secondary"}>{contact.status}</Badge>
          <Button variant="outline" onClick={() => router.push(`/contacts/${contactId}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity ({activities?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.phone}</span>
                </div>
                {contact.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.company}</span>
                  </div>
                )}
                {contact.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={contact.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">{contact.website}</a>
                  </div>
                )}
                {contact.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Deal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Source</span>
                  <span>{contact.source}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Industry</span>
                  <span>{contact.industry ?? "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Value</span>
                  <span className="font-medium">
                    {contact.estimatedValue ? `$${contact.estimatedValue.toLocaleString()}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tags</span>
                  <span>{contact.tags ?? "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(contact.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {contact.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="pt-6">
              {!activities || activities.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No activity yet</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity._id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{activity.type}</Badge>
                          <span className="text-sm font-medium">{activity.title}</span>
                        </div>
                        {activity.details && (
                          <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
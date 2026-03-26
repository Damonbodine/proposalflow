"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { MoreHorizontal, Plus, Pencil, Archive, Eye, FileText } from "lucide-react";
import { TableSkeleton } from "@/components/table-skeleton";

const sampleData: Record<string, string> = {
  "{{contact.firstName}}": "John",
  "{{contact.lastName}}": "Doe",
  "{{contact.company}}": "Acme Corp",
  "{{contact.email}}": "john@acmecorp.com",
  "{{contact.phone}}": "(555) 123-4567",
  "{{contact.jobTitle}}": "Director of Operations",
  "{{date}}": new Date().toLocaleDateString(),
  "{{proposalTitle}}": "Service Proposal",
};

function renderWithSampleData(content: string): string {
  let result = content;
  for (const [key, value] of Object.entries(sampleData)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

export function TemplatesDataTable() {
  const templates = useQuery(api.proposalTemplates.list, {});
  const deactivate = useMutation(api.proposalTemplates.deactivate);
  const router = useRouter();
  const [previewTemplate, setPreviewTemplate] = useState<{ name: string; content: string } | null>(null);

  if (templates === undefined) return <TableSkeleton rows={4} cols={5} />;
  if (templates.length === 0)
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No templates found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Create your first template to speed up proposal creation</p>
          <Button className="mt-4" onClick={() => router.push("/templates/new")}>
            <Plus className="mr-2 h-4 w-4" /> Create Template
          </Button>
        </CardContent>
      </Card>
    );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template._id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/templates/${template._id}/edit`)}>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{template.category}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground max-w-[300px] truncate">
                {template.description ?? "\u2014"}
              </TableCell>
              <TableCell>
                <Badge variant={template.isActive ? "default" : "secondary"}>
                  {template.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(template.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()} />}>
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setPreviewTemplate({ name: template.name, content: template.defaultContent ?? "" }); }}>
                      <Eye className="mr-2 h-4 w-4" /> Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/templates/${template._id}/edit`); }}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    {template.isActive && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deactivate({ templateId: template._id }); }}>
                        <Archive className="mr-2 h-4 w-4" /> Deactivate
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Template Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/30 p-4 max-h-[400px] overflow-y-auto">
            {previewTemplate?.content ? (
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                {renderWithSampleData(previewTemplate.content)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No content in this template.</p>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Sample data: John Doe at Acme Corp (john@acmecorp.com)
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </>
  );
}

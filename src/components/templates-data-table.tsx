"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Pencil, Archive } from "lucide-react";

export function TemplatesDataTable() {
  const templates = useQuery(api.proposalTemplates.list, {});
  const deactivate = useMutation(api.proposalTemplates.deactivate);
  const router = useRouter();

  if (!templates) return <div className="p-8 text-center text-muted-foreground">Loading templates...</div>;
  if (templates.length === 0)
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No templates found</p>
        <Button className="mt-4" onClick={() => router.push("/templates/new")}>
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Button>
      </div>
    );

  return (
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
          <TableRow key={template._id}>
            <TableCell className="font-medium">{template.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{template.category}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground max-w-[300px] truncate">
              {template.description ?? "—"}
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
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/templates/${template._id}/edit`)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  {template.isActive && (
                    <DropdownMenuItem onClick={() => deactivate({ templateId: template._id })}>
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
  );
}
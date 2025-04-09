"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function SettingsForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match if changing password
    if (formData.newPassword || formData.oldPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("New passwords don't match");
        return;
      }
      if (!formData.oldPassword) {
        toast.error("Current password is required to change password");
        return;
      }
    }

    // Don't send empty fields
    const updateData = {
      ...(formData.name && { name: formData.name }),
      ...(formData.newPassword && { 
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword 
      }),
    };

    // Don't submit if no changes
    if (Object.keys(updateData).length === 0) {
      toast.error("No changes to update");
      return;
    }

    setIsLoading(true);
    
    const promise = fetch("/api/profile/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Update Failed");
      }
      return data;
    });

    toast.promise(promise, {
      loading: 'Updating your information...',
      success: (data) => {
        setFormData({
          name: "",
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        return 'Information successfully updated';
      },
      error: (err) => {
        return err.message || 'Something went wrong';
      },
    });

    try {
      await promise;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Update your account information and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className={cn("space-y-6", className)}
            onSubmit={handleSubmit}
            {...props}
          >
            {/* Name Update Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Profile Information</h3>
              <div className="grid gap-3">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter new display name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Separator />

            {/* Password Update Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Change Password</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="oldPassword">Current Password</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={formData.oldPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, oldPassword: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Updating..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

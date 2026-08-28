'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SettingsForm() {
  const [workspaceName, setWorkspaceName] = useState('GoOrder Workspace');
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="max-w-lg space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="workspaceName">Workspace name</Label>
        <Input
          id="workspaceName"
          value={workspaceName}
          onChange={(event) => {
            setWorkspaceName(event.target.value);
            setSaved(false);
          }}
        />
      </div>
      <Button type="submit">Save changes</Button>
      {saved ? <p className="text-sm text-emerald-600">Settings saved locally.</p> : null}
    </form>
  );
}

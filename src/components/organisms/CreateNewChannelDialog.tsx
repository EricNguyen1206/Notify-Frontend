import { Dispatch, FormEvent, SetStateAction } from "react";

import { UserSearchInput } from "@/components/molecules/UserSearchInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateChannel } from "@/hooks/useCreateChannel";

interface CreateNewChannelDialogProps {
  openCreateChannel: boolean;
  setOpenCreateChannel: Dispatch<SetStateAction<boolean>>;
  children: React.ReactNode;
}

const CreateNewChannelDialog = (props: CreateNewChannelDialogProps) => {
  const { openCreateChannel, setOpenCreateChannel, children } = props;

  const { formData, loading, createChannel, updateFormData, updateSelectedUsers, resetForm } = useCreateChannel({
    defaultType: "group",
    onSuccess: () => {
      // Close dialog and reset form on successful creation
      setOpenCreateChannel(false);
    },
  });

  const handleCreateNewChannel = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createChannel();
  };

  const handleDialogChange = (open: boolean) => {
    setOpenCreateChannel(open);
    if (!open) {
      // Reset form when dialog is closed
      resetForm();
    }
  };

  return (
    <Dialog open={openCreateChannel} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <div>{children}</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground font-semibold">Create Channel</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-6" onSubmit={handleCreateNewChannel}>
          <div className="flex flex-col gap-3">
            <Label htmlFor="name" className="text-xs font-bold text-left text-foreground uppercase tracking-wide">
              Channel Name
            </Label>
            <Input
              id="name"
              className="bg-input-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-chat-primary"
              placeholder="Enter channel name"
              value={formData.name}
              onChange={(e) => {
                updateFormData({ name: e.target.value });
              }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-xs font-bold text-left text-foreground uppercase tracking-wide">
              Select Users
            </Label>
            <UserSearchInput
              selectedUsers={formData.selectedUsers}
              onUsersChange={updateSelectedUsers}
              maxUsers={4}
              minUsers={2}
              disabled={loading}
            />
          </div>

          <DialogFooter className="gap-3">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="border-chat-border bg-background text-foreground hover:bg-chat-accent/10 hover:text-chat-primary hover:border-chat-primary"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="default"
              className="bg-chat-primary hover:bg-chat-secondary text-white font-medium"
              disabled={loading || formData.selectedUsers.length < 2}
            >
              {loading ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewChannelDialog;

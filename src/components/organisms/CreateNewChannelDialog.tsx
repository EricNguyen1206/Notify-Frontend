import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePostChannels } from "@/services/endpoints/channels/channels";
import { PostChannelsBody } from "@/services/schemas";
import { useAuthStore } from "@/store/useAuthStore";
import { useChannelStore } from "@/store/useChannelStore";

interface CreateNewChannelDialogProps {
  openCreateChannel: boolean;
  setOpenCreateChannel: Dispatch<SetStateAction<boolean>>;
  children: React.ReactNode;
}

const CreateNewChannelDialog = (props: CreateNewChannelDialogProps) => {
  const { openCreateChannel, setOpenCreateChannel, children } = props;
  const {user} = useAuthStore((state) => state);
  const { addChannel } = useChannelStore((state) => state);

  const initForm: PostChannelsBody = {
    name: "",
    ownerId: user?.id || 0,
    }
  const [formData, setFormData] = useState<PostChannelsBody>(initForm);
  const [loading, setLoading] = useState<boolean>(false);



  const postChannelMutation = usePostChannels({
    mutation: {
      onSuccess: (data) => {
        toast.success("Create new channel successfully");
        // Optionally, refetch channels or update state here
        setOpenCreateChannel(false);
        setFormData(initForm);
        setLoading(false);
      },
      onError: () => {
        toast.error("Create channel failed");
        setLoading(false);
      }
    }
  });

  const handleCreateNewChannel = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.name === "") {
      toast.error("Please type channel name");
      return;
    }
    setLoading(true);
    const res = await postChannelMutation.mutateAsync({
      data: formData
    });

    const newChannel = {
      id: res.data.id!,
      name: res.data.name!,
      ownerId: user?.id!,
      createdAt: res.data.createdAt!
    }
    addChannel(newChannel)
  };
  
  return (
    <Dialog open={openCreateChannel} onOpenChange={setOpenCreateChannel}>
      <DialogTrigger asChild>
        <div>{children}</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-8"
          onSubmit={(e) => {
            handleCreateNewChannel(e);
          }}
        >
          <div className="flex flex-col gap-3">
            <Label htmlFor="name" className="text-[12px] font-bold text-left">
              CHANNEL NAME
            </Label>
            <Input
              id="name"
              className="col-span-3"
              placeholder="New category"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
              }}
            />
          </div>
          {/* <div className="flex flex-col gap-3">
            <Label htmlFor="type" className="text-[12px] font-bold text-left">
              CHANNEL TYPE
            </Label>
            <RadioGroup
              className="flex flex-col gap-5"
              defaultValue={formData.type}
              onValueChange={(value: string) => {
                setFormData({ ...formData, type: value });
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="r1" />
                <Label htmlFor="r1" className="flex items-center gap-3">
                  <p className="text-[35px]">#</p>
                  <div className="flex flex-col gap-2">
                    <p className="font-bold">Text</p>
                    <p className="text-zinc-400 dark:text-zinc-500">
                      Send messages, images, GIFs, emoji, opinions, and puns
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="voice" id="r2" />
                <Label htmlFor="r1" className="flex items-center gap-3">
                  <p className="text-[30px]">
                    <HiSpeakerWave size={25} />
                  </p>
                  <div className="flex flex-col gap-2">
                    <p className="font-bold">Voice</p>
                    <p className="text-zinc-400 dark:text-zinc-500">
                      Hang out together with voice, video, and screen share
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div> */}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="purple"
              disabled={loading ? true : false}
            >
              Create Channel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewChannelDialog;

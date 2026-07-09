import Input from "@/components/ui/Input"
import { editCardDetailRequest as ICardForm } from "@/features/cards/adapters/request"
import * as z from "zod"
import { useForm } from "react-hook-form"
import DatePicker from "@/components/ui/DatePicker"

export default function CardForm() {
  const { formState, setValue } = useForm<ICardForm>({
    defaultValues: {
      title: "",
      description: "",
      content: "",
      publishTime: undefined,
      endTime: undefined,
      eventTime: undefined,
    },
  })

  // const cardSchema = z.object({
  //   title: z.string().min(1),
  //   description: z.string().max(200).optional(),
  //   eventTime: z.date(),
  //   publishTime: z.date(),
  //   endTime: z.date(),
  // })

  return (
    <>
      <Input
        label="Title"
        description="A short title for this card."
        value={formState.defaultValues?.title}
        onChange={(value) => setValue("title", value)}
      />
      <Input
        label="Description"
        description="Add extra details or notes here."
        value={formState.defaultValues?.description}
        onChange={(value) => setValue("description", value)}
      />
      <Input
        label="Location"
        description="Where this takes place (optional)."
        value={formState.defaultValues?.address}
        onChange={(value) => setValue("address", value)}
      />
      <DatePicker
        label="Publish Time"
        description="When this card will become visible."
        value={formState.defaultValues?.publishTime}
        onChange={(value) => setValue("publishTime", value)}
      />
      <DatePicker
        label="End Time"
        description="When this card will be hidden."
      />
      <DatePicker
        label="Event Time"
        description="The date and time of this activity."
      />
    </>
  )
}

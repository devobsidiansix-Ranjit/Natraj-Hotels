"use client"
import * as z from "zod"
import { Category } from '@prisma/client'
import React, { useState } from 'react'
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
interface RoomFormProps {
    intialData: any;
    categories: Category[];
}
const formSchema = z.object({
  categoryId: z.string().min(1),
  image: z.string().min(1),
  isFeatured: z.boolean().default(false).optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  rating: z.string().min(0).max(5).optional(),
})
type RoomFormValues = z.infer<typeof formSchema>
export const RoomForm: React.FC<RoomFormProps> = ({ intialData, categories }) => {
    const [loading, setLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();
    const { toast } = useToast()
    const title = intialData ? "Edit Room" : "Create a Room"
    const description = intialData ? "you can change the room's category to update room" : "Choose a category to add your with."

    const form = useForm<RoomFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            categoryId: intialData?.categoryId || "",
            image: intialData?.image || "",
            isFeatured: intialData?.isFeatured || false,
            description: intialData?.description || "",
            features: intialData?.features || [],
            rating: intialData?.rating ? String(intialData.rating) : '0',
        }
    })

    const { fields, append, remove } = useFieldArray({
        // @ts-ignore
        name: "features",
        control: form.control,
    });
    const onUpdate = async (data: RoomFormValues) => {
        try {
            setLoading(true);
            await axios.patch(`/api/room/${intialData?.id}`, data);
            router.refresh();
            router.push('/admin/yourrooms')
            toast({
                title: "Room",
                description: "Updated Successfully"
            })

        } catch (error) {
            toast({
                title: "Error",
                description: JSON.stringify(error),
                variant: "destructive" 
            })
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex justify-center items-center w-full h-[80vh]">
            <Card className="min-w-[10rem]">
                <CardHeader>
                    <CardTitle>
                        {title}
                    </CardTitle>
                    <CardDescription>
                        {description}
                    </CardDescription>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-8 w-full">
                                <FormField
                                    name="categoryId"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Category</FormLabel>
                                            <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue
                                                            defaultValue={field.value}
                                                            placeholder="Select a category"
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>)}
                                />
                                <FormField
                                    name="image"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image URL or Upload</FormLabel>
                                            <FormControl>
                                                <div className="flex flex-col gap-3">
                                                    <Input disabled={loading || isUploading} placeholder="Enter Image URL" {...field} />
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm text-gray-500 font-medium">OR Upload:</span>
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            disabled={loading || isUploading}
                                                            className="cursor-pointer"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                try {
                                                                    setIsUploading(true);
                                                                    const formData = new FormData();
                                                                    formData.append("file", file);
                                                                    const res = await axios.post("/api/upload", formData);
                                                                    field.onChange(res.data.fileUrl);
                                                                    toast({
                                                                        title: "Success",
                                                                        description: "Image uploaded successfully",
                                                                    });
                                                                } catch (err) {
                                                                    toast({
                                                                        title: "Error",
                                                                        description: "Failed to upload image",
                                                                        variant: "destructive",
                                                                    });
                                                                } finally {
                                                                    setIsUploading(false);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="description"
                                    control={form.control}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                        <Input
                                            disabled={loading}
                                            placeholder="Enter Description"
                                            {...field}
                                        />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    name="rating"
                                    control={form.control}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rating</FormLabel>
                                        <FormControl>
                                        <Input
                                            disabled={loading}
                                            placeholder="Enter Rating"
                                            {...field}
                                        />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="features"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Features</FormLabel>
                                        <FormControl>
                                        <div className="space-y-2">
                                            {fields.map((item, index) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-2"
                                            >
                                                <Input
                                                disabled={loading}
                                                placeholder={`Feature ${index + 1}`}
                                                {...form.register(`features.${index}`)}
                                                />
                                                <Button
                                                type="button"
                                                onClick={() => remove(index)}
                                                variant="destructive"
                                                >
                                                Remove
                                                </Button>
                                            </div>
                                            ))}
                                            <Button
                                            type="button"
                                            onClick={() => append("")}
                                            disabled={loading}
                                            className="text-white"
                                            >
                                            Add Feature
                                            </Button>
                                        </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isFeatured"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 gap-5">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">
                                                    Make this room featured on home page
                                                </FormLabel>
                                                <FormDescription>
                                                    only 3 rooms can be fetured if you already have featured 3 rooms then do not feature this
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button disabled={loading} className="ml-auto" type="submit">Save Changes</Button>
                            </form>
                        </Form>
                    </CardContent>
                </CardHeader>
            </Card>
        </div>
    )
}
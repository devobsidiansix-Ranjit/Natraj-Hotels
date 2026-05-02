"use client";
import * as z from "zod";
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/ui/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(1),
  price: z.string(),
  features: z.array(z.string()).nonempty("At least one feature is required"),
  images: z.array(z.string()).nonempty("At least one image URL is required"),
  description: z.string(),
  status: z.boolean(),
});

type ColorsFormCreateValues = z.infer<typeof formSchema>;

export const CategoryFormCreate = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const title = "Create a Category";
  const description = "You can create a category here";

  const { toast } = useToast();

  const form = useForm<ColorsFormCreateValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      features: [
        "Doctor on call",
        "Laundry",
        "24*7 room service",
        "Pet friendly ",
        "Pick up and drop",
        "Food facilities",
        "Seth Saawariya ji ",
        "The multi cuisine pure veg restaurant",
      ],
      images: [
        ""
      ],
      status: true,
    },
  });

  const { control, handleSubmit, watch } = form;

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control,
    // @ts-ignore
    name: "features",
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    // @ts-ignore
    name: "images",
  });

  interface ErrorResponse {
    response: AxiosResponse;
  }

  const isErrorResponse = (error: any): error is ErrorResponse => {
    return error.response !== undefined;
  };

  const onCreate = async (data: ColorsFormCreateValues) => {
    try {
      setLoading(true);
      const response: AxiosResponse = await axios.post(`/api/category`, {
        name: data.name,
        price: Number(data.price),
        description: data.description,
        features: data.features,
        images: data.images,
        status: data.status,
      });
      router.refresh();
      router.push("/admin/yourrooms");
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    } catch (error) {
      if (isErrorResponse(error)) {
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        alert("An error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-full p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onCreate)} className="space-y-6">
              <FormField
                name="name"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Enter Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="price"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={loading}
                        placeholder="Price"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="description"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Features</h3>
                  <Button
                    type="button"
                    className="text-white"
                    onClick={() => appendFeature("")}
                    disabled={loading}
                  >
                    Add
                  </Button>
                </div>

                {featureFields.map((item, index) => (
                  <FormField
                    key={item.id}
                    name={`features.${index}`}
                    control={control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            disabled={loading}
                            placeholder={`Feature ${index + 1}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <Button
                          type="button"
                          onClick={() => removeFeature(index)}
                          disabled={loading}
                          className="mt-2 text-white"
                        >
                          Remove Feature
                        </Button>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Images</h3>
                  <Button
                    type="button"
                    className="text-white"
                    onClick={() => appendImage("")}
                    disabled={loading}
                  >
                    Add
                  </Button>
                </div>

                {imageFields.map((item, index) => (
                  <FormField
                    key={item.id}
                    name={`images.${index}`}
                    control={control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            disabled={loading}
                            placeholder={`Image URL ${index + 1}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <Button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={loading}
                          className="mt-2 text-white"
                        >
                          Remove Image
                        </Button>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormField
                name="status"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={loading}
                        />
                        <label className="ml-2">Active</label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                disabled={loading}
                className="ml-auto text-white"
                type="submit"
              >
                Create
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

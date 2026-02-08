// import React from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogDescription,
// } from "../ui/dialog";
// import CustomLayout from "../common/CustomLayout";
// import { Form } from "../ui/form";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { identificationsValidator, PatientIdentificationsValidatorType } from "@/validators/api/masters/patient";
// import FormField from "../form-inputs/FormField";

// interface PatientDocumentUploadModalProps {
//   trigger: React.ReactNode;
//   patientId?: number;
// }

// const PatientDocumentUploadModal = ({
//   trigger,
//   patientId,
// }: PatientDocumentUploadModalProps) => {
//   const [open, setOpen] = React.useState(false);

//   const form = useForm<PatientIdentificationsValidatorType>({
//     defaultValues: {},
//     resolver: zodResolver(identificationsValidator),
//   });

//   const handleSubmit = (values: PatientIdentificationsValidatorType) => {
//     console.log(values);
//   }

//   return (
//     <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
//       <DialogTrigger asChild>{trigger}</DialogTrigger>
//       <DialogContent
//         showCloseButton={false}
//         className="max-w-4xl! border-secondary border-4 bg-white p-0 gap-0"
//       >
//         <DialogHeader>
//           <DialogTitle className="sr-only"></DialogTitle>
//           <DialogDescription className="sr-only">
//             This action cannot be undone. This will permanently delete your
//             account and remove your data from our servers.
//           </DialogDescription>
//         </DialogHeader>
//         <CustomLayout title="Patient Search">
//           <div className="space-y-2">
//             <Form {...form}>
//               <form
//                 className="grid grid-cols-3 gap-2"
//                 onSubmit={form.handleSubmit(handleSubmit)}
//               >
//                 <FormField
//                   label="Name"
//                   type="text"
//                   control={form.control}
//                   name="name"
//                 />
//                 <FormField
//                   label="UHID No"
//                   type="text"
//                   control={form.control}
//                   name="uhid"
//                 />
//                 <FormField
//                   label="Contact No"
//                   type="text"
//                   control={form.control}
//                   name="contactNo"
//                 />
//                 <div className="flex gap-2">
//                   <CustomButton onClick={() => router.push("/patient/new")}>
//                     Register New Patient
//                   </CustomButton>
//                   <CustomButton type="submit">Search</CustomButton>
//                 </div>
//               </form>
//             </Form>
//             <div className="col-span-12">
//               <CustomTable
//                 columns={columns}
//                 data={data?.data || []}
//                 page={page}
//                 total={data?.total}
//                 enableSorting
//                 handleChangePage={setPage}
//                 isLoading={isLoading}
//                 limit={limit}
//                 handleChangeLimit={setLimit}
//                 isError={isError}
//                 error={error}
//               />
//             </div>
//           </div>
//         </CustomLayout>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default PatientDocumentUploadModal;

import { BloodGroup, Gender, MaritalStatus, NameTitle } from "@/generated/prisma/enums";
import { PatientType } from "@/lib/type";
import {
  PatientAddressValidatorType,
  patientValidator,
  PatientValidatorType,
} from "@/validators/api/masters/patient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import CustomButton from "../common/CustomButton";
import PersonalInfoForm from "./PersonalInfoForm";
import AddressInfoFormForm from "./AddressInfoForm";
import ContactInfoForm from "./ContactInfoForm";
import IdentificationInfoForm from "./IdentificationInfoForm";
import EmergencyContactInfoForm from "./EmergencyContactInfoForm";
import RelationsInfoForm from "./RelationsInfoForm";
import NotesInfoForm from "./NotesInfoForm";
import { useCreatePatient, useUpdatePatient } from "@/hooks/query/patient";

const getInitialValues = (data?: PatientType): PatientValidatorType => ({
  title: data?.title ?? NameTitle.MR,
  firstName: data?.firstName ?? "",
  middleName: data?.middleName ?? null,
  lastName: data?.lastName ?? "",
  preferredName: data?.preferredName ?? "",
  dob: data?.dob ? new Date(data.dob) : new Date(),
  identificationMark: data?.identificationMark ?? null,
  gender: data?.gender ?? Gender.Male,
  maritalStatus: data?.maritalStatus ?? MaritalStatus.Married,
  religion: data?.religion ?? "",
  bloodGroup: data?.bloodGroup ?? BloodGroup.A_NEGATIVE,
  isMlcPatient: data?.isMlcPatient ?? false,
  mlcInsuranceType: data?.mlcInsuranceType ?? null,
  mlcPolicyOrCardNumber: data?.mlcPolicyOrCardNumber ?? "",
  ageYears: undefined,
  addresses: (data?.addresses as PatientAddressValidatorType[]) ?? [],
  contacts: data?.contacts ?? [],
  relations: data?.relations ?? [],
  identifications: data?.identifications ?? [],
  emergencyContacts: data?.emergencyContacts ?? [],
  notes: data?.notes ?? [],
});

const PatientFormTabs = ({ data }: { data?: PatientType }) => {
  const [activeTab, setActiveTab] = useState<string>("0");
  const { mutateAsync: create, isPending: creating } = useCreatePatient();
  const { mutateAsync: update, isPending: updating } = useUpdatePatient();

  const tabs = [
    "personal info",
    "address",
    "contacts",
    "identifications",
    "emergency Contacts",
    "relatives",
    "notes",
  ];

  const form = useForm<PatientValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(patientValidator),
  });

  const onSubmit = (values: PatientValidatorType) => {
    if (data) {
      update({ ...values, patientId: data.id, dob: values.dob as Date });
    } else {
      create(values as PatientValidatorType);
    }
  };

  const goNext = () => {
    setActiveTab((pre) => (Number(pre) + 1).toString());
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)}>
          <TabsList className="border-b p-0 h-auto bg-white shadow-none flex justify-between w-full">
            <div className="flex">
              {tabs.map((tab, index) => (
                <TabsTrigger
                  key={tab}
                  disabled={Number(activeTab) < index && !data}
                  className="capitalize text-tiny h-auto w-auto px-2 py-1 rounded-t-2xl data-[state=active]:bg-primary data-[state=active]:text-white cursor-pointer"
                  value={index.toString()}
                >
                  {tab}
                </TabsTrigger>
              ))}
            </div>
            <CustomButton disabled={creating || updating} type="submit">
              Submit
            </CustomButton>
          </TabsList>
          <TabsContent className="grid grid-cols-2 gap-2" value="0">
            <PersonalInfoForm form={form} goNext={goNext} />
          </TabsContent>
          <TabsContent className="grid grid-cols-2 gap-2" value="1">
            <AddressInfoFormForm form={form} goNext={goNext} />
          </TabsContent>
          <TabsContent value="2">
            <ContactInfoForm form={form} goNext={goNext} />
          </TabsContent>
          <TabsContent value="3">
            <IdentificationInfoForm form={form} goNext={goNext} />
          </TabsContent>
          <TabsContent value="4">
            <EmergencyContactInfoForm form={form} goNext={goNext} />
          </TabsContent>
          <TabsContent value="5">
            <RelationsInfoForm form={form} goNext={goNext} />
          </TabsContent>
          <TabsContent value="6">
            <NotesInfoForm form={form} goNext={goNext} />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};

export default PatientFormTabs;

"use client";

import { useParams } from "next/navigation";
import CompletedRadiologyResults from "./CompletedRadiologyResults";

const AdvisedRadiologyTestResults = () => {
  const params: { opdId: string } = useParams();

  return <CompletedRadiologyResults opdId={Number(params.opdId)} />;
};

export default AdvisedRadiologyTestResults;

"use client";

import { useParams } from "next/navigation";
import CompletedPathologyResults from "./CompletedPathologyResults";

const AdvisedPathologyTestResults = () => {
  const params: { opdId: string } = useParams();

  return <CompletedPathologyResults opdId={Number(params.opdId)} />;
};

export default AdvisedPathologyTestResults;

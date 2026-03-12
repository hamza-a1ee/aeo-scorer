import GoogleRedirectHandler from "./google-redirect-handler.component";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GoogleRedirectPage({ searchParams }: Props) {
  const params = await searchParams;
  return <GoogleRedirectHandler searchParams={params} />;
}

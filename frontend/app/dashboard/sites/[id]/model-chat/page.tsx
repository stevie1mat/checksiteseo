import { redirect } from 'next/navigation'

export default async function LegacyModelChatRedirect({ params }: { params: { id: string } }) {
  redirect(`/dashboard/sites/${params.id}/chat`)
}

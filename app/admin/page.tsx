import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { 
  Menubar, 
  MenubarMenu, 
} from "@/components/ui/menubar"
import { Button } from "@/components/ui/button"

export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="justify-center h-screen w-screen">
      <Menubar className="h-20 p-4">
        <MenubarMenu >
          <Button variant="outline">Collaborators</Button>
        </MenubarMenu>
      </Menubar>
    </div>
  )
}
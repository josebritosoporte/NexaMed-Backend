import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ConfirmarEliminarModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  pacienteNombre: string
  isLoading?: boolean
}

export function ConfirmarEliminarModal({
  isOpen,
  onClose,
  onConfirm,
  pacienteNombre,
  isLoading = false
}: ConfirmarEliminarModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Eliminación
          </DialogTitle>
          <DialogDescription className="pt-4">
            ¿Está seguro que desea eliminar al paciente <strong className="text-foreground">{pacienteNombre}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer. Se eliminarán permanentemente:
            </p>
            <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Los datos del paciente</li>
              <li>El historial de consultas</li>
              <li>Las órdenes médicas asociadas</li>
              <li>Toda la información del expediente</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Eliminando...
              </div>
            ) : (
              'Sí, Eliminar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

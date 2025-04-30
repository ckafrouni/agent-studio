import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { GraphUpdate } from '@/types/chat'

export function WorkflowSteps({ steps }: { steps: GraphUpdate[] }) {
	return (
		<Accordion type="multiple" className="text-muted-foreground">
			{steps
				.filter((step) => {
					const stepData = Object.values(step)[1] as string
					return !((stepData as { final_node?: boolean }).final_node ?? false)
				})
				.map((step, stepIndex) => {
					const stepName = Object.values(step)[0] as string
					const stepData = Object.values(step)[1] as string
					return (
						<AccordionItem key={stepIndex} value={`step-${stepIndex}`} className="">
							<AccordionTrigger className="text-xs hover:cursor-pointer">
								Step {stepIndex + 1} - {stepName}
							</AccordionTrigger>
							<AccordionContent>
								<pre className="overflow-x-auto text-xs">{JSON.stringify(stepData, null, 2)}</pre>
							</AccordionContent>
						</AccordionItem>
					)
				})}
		</Accordion>
	)
}

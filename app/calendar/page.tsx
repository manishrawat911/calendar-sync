'use client'
import { Calendar, momentLocalizer, Event, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import {v4 as uuidv4} from 'uuid';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { randomUUID } from 'crypto';

const localizer = momentLocalizer(moment)
const DnDCalendar = withDragAndDrop(Calendar);

interface MyEvent extends Event {
  title: string;
  resourceId: string;
}


export default function Page() {
  const [events, setEvents] = useState<MyEvent>([]);
  const [newEvent,setNewEvent] = useState<MyEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date(2015, 3, 1))
  const [view, setView] = useState(Views.WEEK)

  const onNavigate = useCallback((newDate) => setDate(newDate), [setDate])
  const onView = useCallback((newView) => setView(newView), [setView])

  function saveEvent(){
    console.log(`Saving new event: ${newEvent.title}, ${newEvent.start}, ${newEvent.end} `);
    setEvents((oldEvents) => {
      return [...oldEvents, newEvent];
    });
    setOpen(false);
  }

  useEffect(() => {
    console.log(`All Events: ${JSON.stringify(events)}`);
  }, [events]);

  function onSelectSlot(event){
    if(event.action === 'doubleClick'){
      console.log(`Slot selected ${{...event}}`);
      setNewEvent({
        //generate random id for the event
        resourceId : uuidv4(), 
        title: 'New Event',
        start: event.start,
        end: event.end,
      });
      setOpen(true);
    }
  }

  function resizeEvent(event){
    // find event based on resourceId and update new start and end
    let updatedEvent = events.find((e) => e.resourceId === event.event.resourceId);
    if(updatedEvent){
      updatedEvent!.start = event.start;
      updatedEvent!.end = event.end;
      setEvents((oldEvents) => {
        return oldEvents.map((e) => {
          if(e.resourceId === event.event.resourceId){
            return updatedEvent;
          }
          return e;
        });
      });
    }
    console.log(`Resized event title: ${event.event.title}`);
    console.log(`Resized event resourceId: ${event.event.resourceId}`);
    console.log(`Resized event start: ${event.start}`);
    console.log(`Resized event end: ${event.end}`);
  }
  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
          {/* <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription> */}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Title
            </Label>
            <Input
              value={newEvent?.title}
              // defaultValue="Meeting with John"
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start" className="text-right">
              Starts at
            </Label>
            <Input value={newEvent?.start} readOnly
              id="start"
              defaultValue="@peduarte"
              className="col-span-3"
            />
            <Label htmlFor="end" className="text-right">
              Ends at
            </Label>
            <Input value={newEvent?.end} readOnly
              id="end"
              defaultValue="@peduarte"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={saveEvent}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
      {/* <h1>Calendar</h1> */}
      <DnDCalendar
        localizer={localizer}
        events={events}
        selectable='true'
        onSelectSlot={onSelectSlot}
        defaultView='week'
        views={['week']}
        draggableAccessor= {(event) => true}
        startAccessor="start"
        endAccessor="end"
        onView={onView}
        onNavigate={onNavigate}
        resizable={true}
        onEventResize={resizeEvent}
        onEventDrop={resizeEvent}
        // style={{ height: 500 }}
        />
    </>
  )
}
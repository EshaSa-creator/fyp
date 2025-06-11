import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Appointment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ServiceType } from "@/components/services/service-card";
import BookingModal from "@/components/services/booking-modal";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  formatDate,
  formatTime,
  formatAppointmentStatus
} from "@/lib/utils";
import { 
  Loader2, 
  Calendar,
  Clock, 
  AlertCircle, 
  CheckCircle, 
  X,
  Plus,
  Scissors,
  DogIcon,
  Cat,
  Stethoscope
} from "lucide-react";

export default function AppointmentPage() {
  const { toast } = useToast();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Fetch appointments
  const { data: appointments = [], isLoading, error } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  // Split appointments into upcoming and past
  const upcomingAppointments = appointments.filter(
    app => app.status === "pending" || app.status === "confirmed"
  );
  
  const pastAppointments = appointments.filter(
    app => app.status === "completed" || app.status === "cancelled"
  );

  // Cancel appointment mutation
  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/appointments/${id}/status`, { status: "cancelled" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle service booking
  const handleBookService = (serviceType: ServiceType) => {
    setSelectedService(serviceType);
    setIsBookingModalOpen(true);
  };
  
  // Get service icon
  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "grooming":
        return <Scissors className="h-5 w-5 text-primary" />;
      case "training":
        return <DogIcon className="h-5 w-5 text-amber-500" />;
      case "vet":
        return <Stethoscope className="h-5 w-5 text-blue-500" />;
      default:
        return <Calendar className="h-5 w-5 text-neutral-500" />;
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-200";
    }
  };

  // Get pet icon
  const getPetIcon = (petType: string) => {
    switch (petType) {
      case "dog":
        return <DogIcon className="h-5 w-5 text-neutral-600" />;
      case "cat":
        return <Cat className="h-5 w-5 text-neutral-600" />;
      default:
        return null;
    }
  };

  // Handle cancel appointment
  const handleCancelAppointment = (id: number) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      cancelMutation.mutate(id);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <span className="ml-2">Loading your appointments...</span>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center text-red-500 mb-4">
              <AlertCircle className="mr-2" />
              <h2 className="text-lg font-semibold">Error Loading Appointments</h2>
            </div>
            <p className="text-neutral-600">{error.message}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-primary"
            >
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-neutral-100 py-8">
        <div className="container mx-auto px-4">
          <Breadcrumb className="mb-6">
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Services</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h1 className="font-heading font-bold text-3xl mb-2">Pet Services</h1>
              <p className="text-neutral-600">Book and manage your pet care appointments</p>
            </div>
            <Button 
              onClick={() => {
                setSelectedService(null);
                setIsBookingModalOpen(true);
              }}
              className="mt-4 md:mt-0 bg-primary flex items-center"
            >
              <Plus className="mr-2" size={16} />
              Book New Appointment
            </Button>
          </div>

          {/* Services section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Scissors className="mr-2 text-primary" size={18} />
                  Grooming Services
                </CardTitle>
                <CardDescription>
                  Professional grooming for all pet breeds
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <p>Includes bathing, hair trimming, nail clipping, and more. Our expert groomers provide personalized care.</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  onClick={() => handleBookService("grooming")}
                  className="w-full bg-primary"
                >
                  Book Grooming
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <DogIcon className="mr-2 text-amber-500" size={18} />
                  Training Sessions
                </CardTitle>
                <CardDescription>
                  Expert training for dogs of all ages
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <p>Basic commands, behavior correction, and specialized training to help your dog become well-behaved and happy.</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  onClick={() => handleBookService("training")}
                  className="w-full bg-primary"
                >
                  Book Training
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Stethoscope className="mr-2 text-blue-500" size={18} />
                  Veterinary Care
                </CardTitle>
                <CardDescription>
                  At-home vet visits for your pets
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <p>Schedule visits for check-ups, vaccinations, and minor treatments for your beloved pets in the comfort of your home.</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  onClick={() => handleBookService("vet")}
                  className="w-full bg-primary"
                >
                  Book Vet Visit
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* My Appointments section */}
          <h2 className="font-heading font-bold text-2xl mb-4">My Appointments</h2>
          
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="pt-10 pb-10 text-center">
                <div className="text-6xl mb-4">📆</div>
                <h3 className="font-heading font-bold text-xl mb-4">No Appointments Yet</h3>
                <p className="text-neutral-600 mb-6">
                  You haven't booked any appointments yet. Book a service for your pet today!
                </p>
                <Button 
                  onClick={() => {
                    setSelectedService(null);
                    setIsBookingModalOpen(true);
                  }}
                  className="bg-primary"
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Tabs 
                defaultValue="upcoming" 
                onValueChange={setActiveTab}
                className="mb-6"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upcoming">
                    Upcoming ({upcomingAppointments.length})
                  </TabsTrigger>
                  <TabsTrigger value="past">
                    Past ({pastAppointments.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                  {upcomingAppointments.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 pb-6 text-center">
                        <p className="text-neutral-600">
                          You don't have any upcoming appointments.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <Card key={appointment.id}>
                          <CardContent className="pt-6 pb-4">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div className="mb-4 md:mb-0">
                                <div className="flex items-center mb-2">
                                  <h3 className="font-medium text-lg mr-3 flex items-center">
                                    {getServiceIcon(appointment.serviceType)}
                                    <span className="ml-2 capitalize">
                                      {appointment.serviceType} Service
                                    </span>
                                  </h3>
                                  <Badge 
                                    className={getStatusBadgeVariant(appointment.status)}
                                    variant="outline"
                                  >
                                    {formatAppointmentStatus(appointment.status)}
                                  </Badge>
                                </div>
                                
                                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-neutral-600">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {formatDate(appointment.appointmentDate)}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {formatTime(appointment.appointmentTime)}
                                  </div>
                                  <div className="flex items-center">
                                    {getPetIcon(appointment.petType)}
                                    <span className="ml-1 capitalize">
                                      {appointment.petBreed || appointment.petType}
                                    </span>
                                  </div>
                                </div>
                                
                                {appointment.notes && (
                                  <div className="mt-3 text-sm">
                                    <p className="font-medium">Notes:</p>
                                    <p className="text-neutral-600">{appointment.notes}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col justify-between items-end">
                                <span className="font-medium">
                                  {appointment.serviceType === "grooming" ? "$35" : 
                                   appointment.serviceType === "training" ? "$50" : "$75"}
                                </span>
                                
                                {appointment.status !== "cancelled" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="past">
                  {pastAppointments.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 pb-6 text-center">
                        <p className="text-neutral-600">
                          You don't have any past appointments.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {pastAppointments.map((appointment) => (
                        <Card key={appointment.id} className="opacity-90">
                          <CardContent className="pt-6 pb-4">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <div className="flex items-center mb-2">
                                  <h3 className="font-medium text-lg mr-3 flex items-center">
                                    {getServiceIcon(appointment.serviceType)}
                                    <span className="ml-2 capitalize">
                                      {appointment.serviceType} Service
                                    </span>
                                  </h3>
                                  <Badge 
                                    className={getStatusBadgeVariant(appointment.status)}
                                    variant="outline"
                                  >
                                    {formatAppointmentStatus(appointment.status)}
                                  </Badge>
                                </div>
                                
                                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-neutral-600">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {formatDate(appointment.appointmentDate)}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {formatTime(appointment.appointmentTime)}
                                  </div>
                                  <div className="flex items-center">
                                    {getPetIcon(appointment.petType)}
                                    <span className="ml-1 capitalize">
                                      {appointment.petBreed || appointment.petType}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-3 md:mt-0 flex md:flex-col items-center md:items-end justify-between">
                                <span className="font-medium">
                                  {appointment.serviceType === "grooming" ? "$35" : 
                                   appointment.serviceType === "training" ? "$50" : "$75"}
                                </span>
                                
                                {appointment.status === "completed" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-primary border-primary-200 hover:bg-primary-50"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Book Again
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>

      {/* Booking modal */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        serviceType={selectedService} 
      />

      <Footer />
    </>
  );
}

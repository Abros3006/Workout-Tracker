
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Dumbbell, LineChart, List, CalendarClock } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const features = [
    {
      icon: <Dumbbell className="h-8 w-8 text-primary" />,
      title: "Create Custom Workouts",
      description: "Build personalized workout routines tailored to your fitness goals."
    },
    {
      icon: <CalendarClock className="h-8 w-8 text-primary" />,
      title: "Daily Logging",
      description: "Record your exercises, sets, reps, and weights for every workout session."
    },
    {
      icon: <LineChart className="h-8 w-8 text-primary" />,
      title: "Track Progress",
      description: "Visualize your fitness journey with detailed stats and progress charts."
    },
    {
      icon: <List className="h-8 w-8 text-primary" />,
      title: "Workout History",
      description: "Access your complete workout history to review and analyze past performance."
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Fitness Simplified
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6">
              Track Your <span className="text-primary">Workouts.</span> Elevate Your <span className="text-primary">Fitness.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              Welcome to PowerTrack, your personal workout companion. Create custom workouts, log your progress, and achieve your fitness goals with our intuitive tracking system.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="hover-scale button-glow group"
                onClick={() => user ? navigate('/dashboard') : navigate('/login')}
              >
                {user ? 'Go to Dashboard' : 'Get Started'} 
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              {!user && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="hover-scale"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              )}
            </div>
          </motion.div>
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="glass-card p-1 bg-gradient-to-br from-primary/5 to-primary/20 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1581009137042-c552e485697a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                alt="Person tracking workout" 
                className="rounded-lg w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            PowerTrack provides all the tools you need to plan, track, and analyze your fitness journey.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerAnimation}
          initial="hidden"
          animate="show"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="glass-card p-6 hover-scale"
              variants={itemAnimation}
            >
              <div className="mb-4 p-3 inline-flex rounded-lg bg-primary/10">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <motion.div 
          className="glass-card p-10 md:p-16 bg-gradient-to-r from-primary/10 to-primary/5 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Fitness Journey?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join PowerTrack today and take the first step towards tracking and achieving your fitness goals.
          </p>
          <Button 
            size="lg" 
            className="hover-scale button-glow"
            onClick={() => user ? navigate('/dashboard') : navigate('/login')}
          >
            {user ? 'Go to Dashboard' : 'Start Tracking Now'}
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;

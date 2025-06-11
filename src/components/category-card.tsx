import React from "react";
import { Link } from "wouter";

interface CategoryCardProps {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
}

export default function CategoryCard({ title, description, imageUrl, linkUrl }: CategoryCardProps) {
  return (
    <Link href={linkUrl}>
      <div className="group block rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
        <div 
          className="h-64 bg-cover bg-center group-hover:scale-105 transition-transform duration-300" 
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="p-6 bg-white">
          <h3 className="font-heading font-semibold text-xl mb-2">{title}</h3>
          <p className="text-neutral-600 mb-4">{description}</p>
          <span className="text-primary font-medium">
            Shop Now 
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 inline-block ml-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
